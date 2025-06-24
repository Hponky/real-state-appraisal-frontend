import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId, anonymousSessionId } = await request.json();

  if (!userId || !anonymousSessionId) {
    return NextResponse.json(
      { error: 'El userId y anonymousSessionId son requeridos' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies: () => cookies() });

  try {
    const { data, error } = await supabase.rpc('associate_anonymous_appraisals', {
      anonymous_id: anonymousSessionId,
      new_user_id: userId,
    });

    if (error) {
      console.error('Error al asociar los peritajes:', error);
      return NextResponse.json(
        { error: 'Fallo al asociar los peritajes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Peritajes asociados exitosamente',
      data,
    });
  } catch (e) {
    const error = e as Error;
    console.error('Error inesperado:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado', details: error.message },
      { status: 500 }
    );
  }
}