import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/components/supabase-provider'; // Importar el hook del proveedor

interface AuthState {
  user: User | null;
  session: Session | null; // Añadir la sesión al estado de autenticación
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

  // Devolver el usuario de la sesión del proveedor, la sesión y el estado de carga local
  return { user: session?.user ?? null, session: session ?? null, isLoading };
}