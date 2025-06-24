import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// El nombre de la variable de entorno que definiste en .env.local
const EXPECTED_API_KEY = process.env.N8N_API_KEY;

export async function POST(request: Request) {
  // --- 1. Validación de Seguridad (¡MUY IMPORTANTE!) ---

  // Verifica que la variable de entorno esté configurada en el servidor
  if (!EXPECTED_API_KEY) {
    console.error("FATAL: N8N_API_KEY environment variable is not set!");
    // No des mucha información al cliente sobre el error interno
    return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
  }

  // Obtén la clave API del header 'X-API-KEY' (o 'Authorization' si prefieres)
  // Los nombres de header son insensibles a mayúsculas/minúsculas por estándar,
  // pero es común usar 'X-API-KEY' o 'Authorization'.
  const receivedApiKey = request.headers.get('N8N_API_KEY'); // '.get' busca de forma insensible

  // Compara la clave recibida con la esperada
  if (receivedApiKey !== EXPECTED_API_KEY) {
    // Si no coinciden (o no se envió la clave), devuelve un error 401 Unauthorized
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- ¡Si llegamos aquí, la clave API es válida! Continuamos con el resto de la lógica ---

  try {
    // --- 2. Obtener los datos enviados por n8n ---
    const rawReceivedData = await request.json();


    // --- 3. Consolidar y validar los datos recibidos de n8n ---
    let consolidatedAppraisalData: any = {};
    if (Array.isArray(rawReceivedData)) {
      // Combinar todos los objetos del array en uno solo
      consolidatedAppraisalData = rawReceivedData.reduce((acc, currentItem) => ({ ...acc, ...currentItem }), {});
    } else {
      // Si no es un array, asumimos que ya es el objeto consolidado
      consolidatedAppraisalData = rawReceivedData;
    }


    let requestId: string | undefined;

    // Priorizar requestId en la raíz del objeto consolidado
    if (consolidatedAppraisalData.requestId) {
      requestId = consolidatedAppraisalData.requestId;
    } else if (consolidatedAppraisalData.informacion_basica?.requestId) {
      // Si no está en la raíz, buscar en informacion_basica
      requestId = consolidatedAppraisalData.informacion_basica.requestId;
    } else if (consolidatedAppraisalData.analisis_legal_arrendamiento?.requestId) {
      // Si no está en informacion_basica, buscar en analisis_legal_arrendamiento
      requestId = consolidatedAppraisalData.analisis_legal_arrendamiento.requestId;
    }

    if (!requestId) {
      console.error('Invalid data received from n8n: missing or unlocatable requestId'); // Log de error de validación
      return NextResponse.json({ error: 'Invalid data format: requestId not found' }, { status: 400 });
    }

    // --- 4. Guardar los datos recibidos de n8n en Supabase usando la clave de rol de servicio ---
    // Extraer la cookie de Supabase directamente del objeto consolidado
    const supabaseCookieString = consolidatedAppraisalData.cookie_sesion_origen;

    let userId: string | null = null;
    let anonymousSessionId: string | null = null;

    // Priorizar userId si viene en el payload
    if (consolidatedAppraisalData.userId) {
      userId = consolidatedAppraisalData.userId;
    } else if (supabaseCookieString) {
      // Si no viene en el payload, intentar obtenerlo de la cookie de sesión
      const authCookieNameMatch = supabaseCookieString.match(/sb-[a-z0-9]+-auth-token=(.*?)(?:;|$)/);
      let accessToken = authCookieNameMatch ? decodeURIComponent(authCookieNameMatch[1]) : null;

      if (accessToken) {
        try {
          const parsedTokenArray = JSON.parse(accessToken);
          if (Array.isArray(parsedTokenArray) && typeof parsedTokenArray[0] === 'string') {
            accessToken = parsedTokenArray[0];
          } else {
            console.warn("[API /receive] Access token is not a stringified JSON array or first element is not a string.");
          }
        } catch (parseError) {
          console.warn("[API /receive] Could not parse access token as JSON array, using as is:", accessToken);
        }
      }

      if (accessToken) {
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError) {
          console.error("[API /receive] Error getting user from access token:", userError);
        } else if (user) {
          // Supabase asigna un user.id incluso a sesiones anónimas.
          // Para diferenciar, verificamos si el usuario tiene un email o phone (indicativo de autenticación).
          if (user.email || user.phone) {
            userId = user.id;
            anonymousSessionId = null; // Asegurarse de que sea nulo para usuarios autenticados
          } else {
            // Si no tiene email ni phone, se considera una sesión anónima
            anonymousSessionId = user.id;
            userId = null; // Asegurarse de que sea nulo para sesiones anónimas
          }
        } else {
          console.warn("[API /receive] No user found for the provided access token.");
        }
      }
    }

    // Si no se encontró userId ni anonymousSessionId de la cookie,
    // y si el payload trae un anonymousSessionId, usarlo.
    // Esto asegura que el anonymousSessionId del payload tenga prioridad si no se pudo determinar desde la cookie.
    if (!userId && !anonymousSessionId && consolidatedAppraisalData.anonymousSessionId) {
      anonymousSessionId = consolidatedAppraisalData.anonymousSessionId;
    }

    // --- 4. Preparar los datos para la tabla 'appraisals' ---

    // Extraer los campos de resultados del peritaje del objeto consolidado
    const {
      analisis_mercado_arriendo,
      valoracion_arriendo_actual,
      potencial_valorizacion_arriendo,
      analisis_legal_arrendamiento,
      metadata_llamadas_ia,
      informacion_basica,
    } = consolidatedAppraisalData;

    // Construir el objeto de datos de resultado
    const resultData = {
      form_data: {
        ciudad: informacion_basica?.ciudad || 'N/A',
        address: informacion_basica?.address || consolidatedAppraisalData.formData?.address,
        area_usuario_m2: informacion_basica?.area_usuario_m2 || 0,
        tipo_inmueble: informacion_basica?.tipo_inmueble || 'N/A',
        estrato: informacion_basica?.estrato || 'N/A',
      },
      analisis_mercado: analisis_mercado_arriendo,
      valoracion_arriendo_actual,
      potencial_valorizacion_con_mejoras_explicado: potencial_valorizacion_arriendo,
      analisis_legal_arrendamiento,
      gemini_usage_metadata: metadata_llamadas_ia,
    };

    // Construir el objeto para la operación upsert en la tabla 'appraisals'
    const upsertData = {
      id: requestId,
      form_data: consolidatedAppraisalData, // Guardar el formulario completo
      result_data: resultData, // Guardar los resultados del peritaje
      status: 'completed',
      user_id: userId,
      anonymous_session_id: anonymousSessionId,
    };

    // --- 5. Guardar/Actualizar el registro en la tabla 'appraisals' ---
    // Usar upsert para crear o actualizar el registro basado en el 'id' (requestId)
    const { error } = await supabaseAdmin
      .from('appraisals')
      .upsert(upsertData, { onConflict: 'id' });

    if (error) {
      console.error('DEBUG: Supabase Upsert Error (appraisals):', error);
      return NextResponse.json({ error: 'Failed to save appraisal data', details: error.message }, { status: 500 });
    }

    // --- 6. Revalidar la ruta de resultados para que el cliente vea los cambios ---
    // Esto le dice a Next.js que la data para esta página ha cambiado y debe ser recargada.
    // Es crucial para que la UI se actualice sin necesidad de recargar la página manualmente.
    try {
      const resultsPath = `/appraisal/results?id=${requestId}`;
      revalidatePath(resultsPath);
      console.log(`[API /receive] Successfully revalidated path: ${resultsPath}`);
    } catch (revalidateError) {
      // Si la revalidación falla, no es un error fatal para el flujo de n8n,
      // pero sí es importante registrarlo para depuración.
      console.error(`[API /receive] Failed to revalidate path for appraisal ${requestId}:`, revalidateError);
    }


    // Responder a n8n para confirmar la recepción y procesamiento
    return NextResponse.json({ success: true, message: 'Appraisal results processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('API Route Error after validation:', error); // Log de error en la ruta
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON received';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    // Para cualquier otro error no manejado, responder con 500
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}
