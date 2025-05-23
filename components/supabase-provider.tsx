"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, SupabaseClient, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface SupabaseContext {
  supabase: SupabaseClient;
  session: Session | null;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Opcional: Forzar una actualización de la ruta para que los Route Handlers lean la nueva cookie
      // if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      //   router.refresh();
      // }
    });

    // Obtener la sesión inicial al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });


    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <Context.Provider value={{ supabase, session }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};