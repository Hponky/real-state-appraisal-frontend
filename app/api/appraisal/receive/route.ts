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

    // --- 3. Validar y extraer el requestId ---
    const { requestId } = appraisalData;

    if (!requestId) {
      console.error('Invalid data received from n8n: missing requestId'); // Log de error de validación
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
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
       return NextResponse.json({ error: 'Failed to save appraisal data', details: error.message }, { status: 500 });
     }

     // Verificar si se actualizó alguna fila
     // Verificar si se actualizó alguna fila
     if (!data) { // Cambiado de data.length === 0 a !data
         console.warn(`DEBUG: Supabase update operation did not affect any rows for ID: ${requestId}.`); // Log de advertencia si no se actualizó ninguna fila
         // Considerar si esto debería ser un error 404 o un 500 dependiendo de la lógica de negocio
         return NextResponse.json({ error: 'Appraisal request not found or not updated' }, { status: 404 });
     }

     console.log("DEBUG: Supabase entry updated successfully. Responding with 200 OK."); // Log de éxito de actualización
     console.log("DEBUG: Responding to n8n with:", { success: true, message: 'Appraisal results saved successfully', data }); // Log de la respuesta enviada a n8n

     // Responder a n8n para confirmar la recepción y guardado
    return NextResponse.json({ success: true, message: 'Appraisal results saved successfully' }, { status: 200 });

  } catch (error) {
     console.error('API Route Error after validation:', error); // Log de error en la ruta
     let errorMessage = 'Internal Server Error';
     if (error instanceof Error) errorMessage = error.message;
     if (error instanceof SyntaxError) {
       errorMessage = 'Invalid JSON received';
       return NextResponse.json({ error: errorMessage }, { status: 400 });
     }
     return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}