import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Importar createClient
import { supabase } from '@/lib/supabase'; // Asegúrate que la ruta a tu cliente supabase sea correcta
// El nombre de la variable de entorno que definiste en .env.local
const EXPECTED_API_KEY = process.env.N8N_API_KEY;

export async function POST(request: Request) {
  console.log("[API /receive] Received POST request."); // Log al inicio de la función
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
    console.warn("Unauthorized API access attempt."); // Opcional: loguear intento fallido
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- ¡Si llegamos aquí, la clave API es válida! Continuamos con el resto de la lógica ---
  console.log("API Key validated successfully. Processing request..."); // Opcional: log de éxito

  try {
    // --- 2. Obtener los datos enviados por n8n ---
    console.log("[API /receive] Attempting to parse request body..."); // Log antes de parsear el body
    const appraisalData = await request.json();
    console.log("[API /receive] Request body parsed successfully."); // Log después de parsear el body

    console.log("Received data from n8n:", appraisalData); // Log para mostrar todo el cuerpo recibido

    // --- 3. Validar y extraer el requestId de forma flexible ---
    let requestId: string | undefined;

    // Priorizar requestId en la raíz
    if (appraisalData.requestId) {
      requestId = appraisalData.requestId;
    } else if (appraisalData.informacion_basica?.requestId) {
      // Si no está en la raíz, buscar en informacion_basica
      requestId = appraisalData.informacion_basica.requestId;
    } else if (appraisalData.analisis_legal_arrendamiento?.requestId) {
      // Si no está en informacion_basica, buscar en analisis_legal_arrendamiento
      requestId = appraisalData.analisis_legal_arrendamiento.requestId;
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

    // Actualizar la entrada existente en Supabase con los resultados y marcar como completada
    console.log(`[API /receive] Attempting to update appraisal with ID: ${requestId} in Supabase.`); // Log antes de la actualización
    const { data, error } = await supabaseServiceRole // Usar el cliente con rol de servicio
      .from('appraisals') // Asegúrate de que 'appraisals' es el nombre correcto de tu tabla
      .update({
        // Almacenar los resultados completos de n8n en la columna jsonb 'initial_data'
        initial_data: appraisalData, // Guardamos el objeto completo recibido de n8n
        status: 'completed', // Marca la solicitud como completada
        created_at: new Date().toISOString(), // Usar created_at en lugar de updated_at
      })
      .eq('id', requestId); // Actualiza la fila con el ID de solicitud (usando requestId)

     console.log("DEBUG: Supabase update operation completed.", { data, error }); // Log después de la actualización de Supabase

     if (error) {
       console.error('DEBUG: Supabase Update Error:', error); // Log de error de Supabase
       // Si hay un error de Supabase, respondemos con 500
       return NextResponse.json({ error: 'Failed to save appraisal data', details: error.message }, { status: 500 });
     }

     // Si no hay error de Supabase, la operación fue procesada.
     // Respondemos siempre con 200 OK a n8n, ya que el frontend usa Realtime para el estado final.
     // La verificación de si 'data' es nulo es más para logging/depuración en este endpoint.
     if (!data) {
         console.warn(`DEBUG: Supabase update operation did not return data for ID: ${requestId}. This might be expected if .select() was not used or if the row was not found, but no Supabase error occurred.`); // Log de advertencia si no se devolvieron datos
     } else {
         console.log(`DEBUG: Supabase update operation returned data for ID: ${requestId}.`); // Log si se devolvieron datos
     }

     console.log("DEBUG: Responding to n8n with 200 OK."); // Log antes de responder

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
