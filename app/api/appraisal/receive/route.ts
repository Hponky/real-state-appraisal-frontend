import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Importar createClient
import { supabase } from '@/lib/supabase'; // Asegúrate que la ruta a tu cliente supabase sea correcta
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
    // Crear una instancia del cliente Supabase con la clave de rol de servicio
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // Usar la URL pública de Supabase
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar la clave de rol de servicio
    );

    // Extraer la cookie de Supabase directamente del objeto consolidado
    const supabaseCookieString = consolidatedAppraisalData.cookie_sesion_origen;

    let userId: string | null = null;

    if (supabaseCookieString) {
      // Buscar el token de acceso de Supabase en la cadena de la cookie
      const authCookieNameMatch = supabaseCookieString.match(/sb-[a-z0-9]+-auth-token=(.*?)(?:;|$)/); // Capture the entire value after the equals sign until a semicolon or end of string
      let accessToken = authCookieNameMatch ? decodeURIComponent(authCookieNameMatch[1]) : null; // Decodificar la cadena completa

      if (accessToken) {
        try {
          // Supabase a veces envuelve el token en un array JSON stringificado
          const parsedTokenArray = JSON.parse(accessToken);
          if (Array.isArray(parsedTokenArray) && typeof parsedTokenArray[0] === 'string') {
            accessToken = parsedTokenArray[0]; // Tomar el primer elemento que es el JWT
          } else {
            console.warn("[API /receive] Access token is not a stringified JSON array or first element is not a string.");
          }
        } catch (parseError) {
          console.warn("[API /receive] Could not parse access token as JSON array, using as is:", accessToken);
          // Si falla el parseo, el token podría ser un JWT directo, así que lo usamos tal cual.
        }
      }

      if (accessToken) {
        const { data: { user }, error: userError } = await supabaseServiceRole.auth.getUser(accessToken);

        if (userError) {
          console.error("[API /receive] Error getting user from access token:", userError);
        } else if (user) {
          userId = user.id;
        } else {
          console.warn("[API /receive] No user found for the provided access token.");
        }
      } else {
      }
    } else {
    }

    if (!userId) {
    }

    // Extraer solo los campos de resultados de la tasación del objeto consolidado
    const {
      analisis_mercado_arriendo, // Nombre de campo corregido
      valoracion_arriendo_actual,
      potencial_valorizacion_arriendo, // Nombre de campo corregido
      analisis_legal_arrendamiento,
      metadata_llamadas_ia, // Nombre de campo corregido
    } = consolidatedAppraisalData;

    const appraisalResultData = {
      analisis_mercado: analisis_mercado_arriendo, // Mapear al nombre esperado en la BD
      valoracion_arriendo_actual,
      potencial_valorizacion_con_mejoras_explicado: potencial_valorizacion_arriendo, // Mapear al nombre esperado en la BD
      analisis_legal_arrendamiento,
      gemini_usage_metadata: metadata_llamadas_ia, // Mapear al nombre esperado en la BD
    };

    const insertObject = {
      request_id: requestId,
      appraisal_data: appraisalResultData, // Guardar solo los resultados de la tasación
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // 4. Guardar los datos recibidos de n8n en la tabla 'appraisal_results'
    const { error: insertError } = await supabaseServiceRole
      .from('appraisal_results')
      .upsert(insertObject, { onConflict: 'request_id' }); // Usar upsert en lugar de insert, con request_id como clave de conflicto

    if (insertError) {
      console.error('DEBUG: Supabase Insert Error (appraisal_results):', insertError);
      return NextResponse.json({ error: 'Failed to save detailed appraisal data', details: insertError.message }, { status: 500 });
    }

    // 5. Actualizar el estado de la solicitud en la tabla 'appraisals'
    const { error: updateError } = await supabaseServiceRole
      .from('appraisals')
      .update({
        status: 'completed', // Marca la solicitud como completada
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('DEBUG: Supabase Update Error (appraisals status):', updateError);
      return NextResponse.json({ error: 'Failed to update appraisal status', details: updateError.message }, { status: 500 });
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
