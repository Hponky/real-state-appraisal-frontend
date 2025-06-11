"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSupabase } from "@/components/supabase-provider";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-background shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Peritaje Inmobiliario
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" passHref>
            <Button variant="ghost">Inicio</Button>
          </Link>
          <Link href="/appraisal" passHref>
            <Button variant="ghost">Peritaje</Button>
          </Link>
          {!isLoading && (
            <>
              {user && user.email ? (
                <>
                  <span className="text-sm text-muted-foreground mr-2">
                    {user.email}
                  </span>
                  <Link href="/history" passHref>
                    <Button variant="ghost">Historial</Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSignOut}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" passHref>
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/auth?register=true" passHref>
                    <Button variant="default">Registrar Cuenta</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}