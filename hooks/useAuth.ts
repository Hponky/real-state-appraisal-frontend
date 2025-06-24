import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/components/supabase-provider';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const { session, isInitialLoading } = useSupabase();

  // isLoading es true si la sesión inicial todavía está cargando.
  // Una vez que isInitialLoading es false, la sesión está establecida (ya sea como null o un objeto de sesión).
  const isLoading = isInitialLoading;

  return { user: session?.user ?? null, session, isLoading };
}