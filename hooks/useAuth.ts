import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isLoading: true });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({ user: session?.user ?? null, isLoading: false });
    });

    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({ user: session?.user ?? null, isLoading: false });
    });

    // Limpiar la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Se ejecuta solo una vez al montar

  // Intentar inicio de sesión anónimo si no hay usuario y no está cargando
  useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      console.log("No authenticated user found, attempting anonymous sign-in from useAuth.");
      supabase.auth.signInAnonymously()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error signing in anonymously:', error);
            // Manejar el error de inicio de sesión anónimo si es necesario
          } else {
            console.log('Anonymous user signed in:', data.user);
            // El onAuthStateChange manejará la actualización del estado
          }
        })
        .catch(err => {
           console.error('Caught error during anonymous sign-in in useAuth:', err);
           // Manejar errores de promesa si es necesario
        });
    }
  }, [authState.isLoading, authState.user]); // Depende del estado de carga y del usuario

  return authState;
}