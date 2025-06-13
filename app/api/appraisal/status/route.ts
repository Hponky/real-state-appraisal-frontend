// app/api/appraisal/status/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Corregir advertencia de cookies() pasando la función directamente
  const supabase = createRouteHandlerClient({ cookies: () => cookies() }); // Crear cliente Supabase para Route Handlers

  const id = searchParams.get('id');


  if (!id) {
    return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
  }

  try {
    // Obtener el usuario autenticado en el contexto del servidor
    const { data: { user }, error: userError } = await supabase.auth.getUser();


    if (userError) {
        console.error('[API /status] Error getting user:', userError);
        // Continuar, ya que la política RLS manejará la falta de autenticación
    }


    // 1. Obtener datos de la tabla 'appraisals' (entrada del formulario)
    const { data: appraisalDataFromAppraisals, error: appraisalError } = await supabase
      .from('appraisals')
      .select('id, status, initial_data, user_id')
      .eq('id', id)
      .single();

    if (appraisalError) {
      console.error('[API /status] Error fetching appraisal status from appraisals table:', appraisalError);
      return NextResponse.json({ error: 'Failed to fetch appraisal status', details: appraisalError.message }, { status: 500 });
    }

    if (!appraisalDataFromAppraisals) {
      return NextResponse.json({ error: 'Appraisal request not found' }, { status: 404 });
    }

    // Si el estado no es 'completed', devuelve el estado actual sin buscar appraisal_data
    if (appraisalDataFromAppraisals.status !== 'completed') {
      return NextResponse.json({ status: appraisalDataFromAppraisals.status || 'pending' }, { status: 202 });
    }

    // 2. Si el estado es 'completed', obtener datos de la tabla 'appraisal_results' (respuesta de n8n)
    const { data: appraisalResultData, error: appraisalResultError } = await supabase
      .from('appraisal_results') // Nombre de la tabla para los resultados de n8n
      .select('appraisal_data') // Columna donde se guarda la respuesta completa de n8n
      .eq('request_id', id) // Corregido a 'request_id' según el modelo Java
      .limit(1);

    if (appraisalResultError) {
      console.error('[API /status] Error fetching appraisal results from appraisal_results table:', appraisalResultError);
      return NextResponse.json({ error: 'Failed to fetch detailed appraisal results', details: appraisalResultError.message }, { status: 500 });
    }

    if (!appraisalResultData || appraisalResultData.length === 0 || !appraisalResultData[0].appraisal_data) {
      return NextResponse.json({ error: 'Detailed appraisal results not found for completed appraisal' }, { status: 404 });
    }

    // 3. Combinar los resultados y enviarlos al frontend
    return NextResponse.json({
      status: 'completed',
      results: {
        initial_data: appraisalDataFromAppraisals.initial_data, // Datos del formulario del usuario
        appraisal_data: appraisalResultData[0].appraisal_data,     // Respuesta completa de n8n
      }
    }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}