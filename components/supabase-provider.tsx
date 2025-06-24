"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, SupabaseClient, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { appraisalApiService } from '@/app/services/appraisalApiService';

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
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session?.user && !session.user.is_anonymous) {
        const anonymousSessionId = localStorage.getItem('anonymous_session_id');
        if (anonymousSessionId) {
          try {
            await appraisalApiService.associateAnonymousAppraisals(anonymousSessionId, session.user.id);
            localStorage.removeItem('anonymous_session_id');
            toast({
              title: "Historial de peritajes anónimos asociado",
              description: "Tus peritajes anteriores ahora están en tu cuenta.",
            });
          } catch (error) {
            console.error("Error al asociar peritajes anónimos:", error);
            toast({
              title: "Error de asociación",
              description: "No se pudieron asociar tus peritajes anónimos.",
              variant: "destructive",
            });
          }
        }
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!initialSession) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('SupabaseProvider: Error al iniciar sesión anónimamente:', error);
        } else {
          setSession(data.session);
        }
      } else {
        setSession(initialSession);
      }
    });

    const appraisalChannel = supabase
      .channel('public:appraisals')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appraisals' },
        (payload) => {
          supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            const newAppraisal = payload.new as { id: string; status: string; user_id: string | null; anonymous_session_id: string | null };
            const currentUserId = currentSession?.user?.id;

            if (
              newAppraisal.status === 'completed' &&
              currentUserId &&
              (newAppraisal.user_id === currentUserId || newAppraisal.anonymous_session_id === currentUserId)
            ) {
              toast({
                title: "Peritaje Completado",
                description: (
                  <Link href={`/appraisal/results?id=${newAppraisal.id}`}>
                    Tu peritaje ha sido completado. Haz clic aquí para ver los resultados.
                  </Link>
                ),
                duration: 10000,
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(appraisalChannel);
    };
  }, [router, supabase, toast]);

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