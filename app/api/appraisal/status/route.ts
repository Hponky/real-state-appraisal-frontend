// app/api/appraisal/status/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  console.log("[API /status] Received GET request."); // Log al inicio de la función
  const { searchParams } = new URL(request.url);
  // Corregir advertencia de cookies() pasando la función directamente
  const supabase = createRouteHandlerClient({ cookies: () => cookies() }); // Crear cliente Supabase para Route Handlers

  const id = searchParams.get('id');

  console.log(`[API /status] Received request for ID: ${id}`); // Log del ID de la solicitud

  if (!id) {
    console.error("[API /status] Missing request ID in search params."); // Log de error de validación
    return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
  }

  try {
    // Obtener el usuario autenticado en el contexto del servidor
    console.log("[API /status] Attempting to get authenticated user..."); // Log antes de obtener usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log(`[API /status] Get user operation completed. User: ${user ? user.id : 'None'}, Error: ${userError ? userError.message : 'None'}`); // Log después de obtener usuario


    if (userError) {
        console.error('[API /status] Error getting user:', userError);
        // Continuar, ya que la política RLS manejará la falta de autenticación
    }

    console.log(`[API /status] Authenticated user ID: ${user ? user.id : 'None'}`); // Log del ID del usuario autenticado

    console.log(`[API /status] Attempting to fetch appraisal with ID: ${id} from Supabase.`); // Log antes de la consulta a Supabase
    const { data, error } = await supabase
      .from('appraisals') // Asegúrate de que 'appraisals' es el nombre correcto de tu tabla
      .select('id, status, initial_data, user_id') // Selecciona user_id también para depuración
      .eq('id', id)
      .single(); // <--- Aquí se espera una única fila
    console.log(`[API /status] Supabase fetch operation completed. Data found: ${!!data}, Error: ${error ? error.message : 'None'}`); // Log después de la consulta a Supabase


    if (error) {
      console.error('Supabase Fetch Error:', error); // Log de error de Supabase
      return NextResponse.json({ error: 'Failed to fetch appraisal status', details: error.message }, { status: 500 });
    }

    if (!data) {
      console.warn(`[API /status] No appraisal request found with ID: ${id}.`); // Log de advertencia si no se encuentra la fila
      return NextResponse.json({ error: 'Appraisal request not found' }, { status: 404 });
    }

    console.log(`[API /status] Appraisal status for ID ${id}: ${data.status}`); // Log del estado del peritaje

    if (data.status === 'completed') {
      // Si está completo, devuelve los resultados
      console.log(`[API /status] Appraisal completed. Returning results for ID: ${id}.`); // Log antes de devolver resultados
      return NextResponse.json({ status: 'completed', results: data }, { status: 200 });
    } else {
      // Si no está completo, indica que está pendiente
      console.log(`[API /status] Appraisal pending. Returning 202 Accepted for ID: ${id}.`); // Log antes de devolver pendiente
      return NextResponse.json({ status: data.status || 'pending' }, { status: 202 }); // 202 Accepted
    }

  } catch (error) {
    console.error('API Route /status Error:', error); // Log de error general
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}