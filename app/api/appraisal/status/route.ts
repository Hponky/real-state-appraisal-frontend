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


    const { data, error } = await supabase
      .from('appraisals') // Asegúrate de que 'appraisals' es el nombre correcto de tu tabla
      .select('id, status, initial_data, user_id') // Selecciona user_id también para depuración
      .eq('id', id)
      .single(); // <--- Aquí se espera una única fila


    if (error) {
      return NextResponse.json({ error: 'Failed to fetch appraisal status', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Appraisal request not found' }, { status: 404 });
    }


    if (data.status === 'completed') {
      // Si está completo, devuelve los resultados con initial_data directamente
      return NextResponse.json({ status: 'completed', results: { ...data, initial_data: data.initial_data } }, { status: 200 });
    } else {
      // Si no está completo, indica que está pendiente
      return NextResponse.json({ status: data.status || 'pending' }, { status: 202 }); // 202 Accepted
    }

  } catch (error) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}