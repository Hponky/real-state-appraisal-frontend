// app/api/appraisal/status/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('appraisals') // Asegúrate de que 'appraisals' es el nombre correcto de tu tabla
      .select('status, economic_evaluation, technical_evaluation, legal_evaluation') // Selecciona solo los campos necesarios
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase Fetch Error:', error);
      return NextResponse.json({ error: 'Failed to fetch appraisal status', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Appraisal request not found' }, { status: 404 });
    }

    if (data.status === 'completed') {
      // Si está completo, devuelve los resultados
      return NextResponse.json({ status: 'completed', results: data }, { status: 200 });
    } else {
      // Si no está completo, indica que está pendiente
      return NextResponse.json({ status: data.status || 'pending' }, { status: 202 }); // 202 Accepted
    }

  } catch (error) {
    console.error('API Route /status Error:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) errorMessage = error.message;
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500 });
  }
}