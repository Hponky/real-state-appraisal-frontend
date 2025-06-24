import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/components/supabase-provider'; // Importar el hook del proveedor

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean; // True while any auth operation is in progress (e.g., initial session fetch, sign in/out)
  isInitialAuthLoaded: boolean; // True once the initial getSession() check is definitively done
}

export function useAuth(): AuthState {
  const { supabase, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialAuthLoaded, setIsInitialAuthLoaded] = useState(false);

  useEffect(() => {
    // This effect runs whenever the session from SupabaseProvider changes.
    // It indicates that the session state has been updated.
    if (session !== undefined) { // session can be null or a Session object
      setIsLoading(false); // Auth is no longer "loading" in the general sense
      setIsInitialAuthLoaded(true); // The initial check is done
    }
  }, [session]);

  return { user: session?.user ?? null, session: session ?? null, isLoading, isInitialAuthLoaded };
}