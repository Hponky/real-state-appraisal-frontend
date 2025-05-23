import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabase } from '@/components/supabase-provider'; // Importar el hook del proveedor

interface AuthState {
  user: User | null;
  isLoading: boolean; // Mantener isLoading si es necesario para otros usos del hook
}

export function useAuth(): AuthState {
  // Obtener el cliente Supabase y la sesión del contexto del proveedor
  const { supabase, session } = useSupabase();

  // El estado de carga ahora puede derivarse de si la sesión ya se ha cargado
  // O podrías mantener un estado isLoading si necesitas un control más granular
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // La sesión ya es manejada por el proveedor, solo necesitamos reaccionar a ella
    if (session !== undefined) { // session puede ser null o un objeto Session
      setIsLoading(false);
    }
  }, [session]); // Depende de la sesión proporcionada por el contexto

  // Lógica para inicio de sesión anónimo (opcional, considera moverla si solo se necesita en /appraisal)
  useEffect(() => {
    // Solo intentar si no hay sesión y no estamos cargando (basado en el estado local)
    if (!isLoading && !session) {
      console.log("No authenticated session found, attempting anonymous sign-in from useAuth.");
      supabase.auth.signInAnonymously()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error signing in anonymously:', error);
            // Manejar el error
          } else {
            console.log('Anonymous user signed in:', data?.user);
            // El estado de la sesión en el proveedor se actualizará automáticamente
          }
        })
        .catch(err => {
           console.error('Caught error during anonymous sign-in in useAuth:', err);
           // Manejar errores de promesa
        });
    }
  }, [isLoading, session, supabase]); // Depende de isLoading, session y supabase del contexto

  // Devolver el usuario de la sesión del proveedor y el estado de carga local
  return { user: session?.user ?? null, isLoading };
}