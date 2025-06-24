"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useSupabase } from "@/components/supabase-provider"; // Importar useSupabase
import { useAuth } from "@/hooks/useAuth"; // Importar useAuth
import { useToast } from "@/hooks/use-toast"; // Importar useToast

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  idNumber: z.string().min(8, "Número de cédula inválido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(10, "Número de teléfono inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type AuthFormData = LoginFormData & Partial<RegisterFormData>; // Combinar tipos para el formulario

export default function Auth() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false); // Inicializar en false, el useEffect lo manejará

  useEffect(() => {
    setIsLogin(searchParams.get("register") !== "true");
    console.log("Auth Page - Initial isLogin:", searchParams.get("register") !== "true");
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabase(); // Obtener la instancia de supabase del contexto
  const { session, user } = useAuth(); // Obtener la sesión y el usuario de useAuth
  const { toast } = useToast(); // Obtener la función toast

  useEffect(() => {
    console.log("Auth Page - Current isLogin state:", isLogin);
    console.log("Auth Page - Supabase session:", session);
    console.log("Auth Page - Supabase user:", user);
  }, [isLogin, session, user]);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      lastName: "",
      idNumber: "",
      phone: "",
    },
  });

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (loginError) {
          throw new Error(loginError.message);
        }
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente.",
        });
        // No redirigir inmediatamente, la lógica de asociación se encargará de eso
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              last_name: data.lastName,
              id_number: data.idNumber,
              phone: data.phone,
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        toast({
          title: "Registro exitoso",
          description: "Por favor, verifica tu correo electrónico para completar el registro.",
        });
        setIsLogin(true); // Cambiar a la vista de inicio de sesión después del registro
      }
    } catch (error: any) {
      console.error("Error de autenticación:", error.message);
      toast({
        title: "Error de autenticación",
        description: error.message || "Ocurrió un error durante la autenticación.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Asegúrate de que esta URL esté configurada en Supabase
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.url) {
        // Supabase redirigirá automáticamente al usuario a la URL de autenticación de Google
        // No necesitamos hacer window.location.href aquí, Supabase lo maneja
      } else {
        throw new Error("URL de redirección de Google no proporcionada.");
      }
    } catch (error: any) {
      console.error("Error de autenticación con Google:", error.message);
      toast({
        title: "Error de autenticación con Google",
        description: error.message || "Ocurrió un error durante la autenticación con Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect para manejar la asociación de datos anónimos después del login
  useEffect(() => {
    const associateAnonymousData = async () => {
      // Asegurarse de que tenemos un usuario autenticado y no anónimo
      if (session && user && !user.is_anonymous) {
        const anonymousSessionId = localStorage.getItem('anonymous_session_id');

        if (anonymousSessionId) {
          try {
            // Llamar al servicio de la API para asociar los datos
            await appraisalApiService.associateAnonymousAppraisals(anonymousSessionId, user.id);

            // Limpiar el ID de localStorage tras el éxito
            localStorage.removeItem('anonymous_session_id');

            toast({
              title: "Cuenta actualizada",
              description: "Tus actividades anónimas han sido asociadas a tu cuenta.",
            });

            // Redirigir al historial para ver los resultados combinados
            router.push("/history");

          } catch (error: any) {
            console.error("Error al asociar datos anónimos:", error);
            toast({
              title: "Error de asociación",
              description: "No se pudieron asociar tus datos anónimos. Por favor, contacta a soporte.",
              variant: "destructive",
            });
            // Redirigir a home incluso si falla para no bloquear al usuario
            router.push("/");
          }
        } else {
          // Si no hay ID anónimo, simplemente redirigir a la página principal
          router.push("/");
        }
      }
    };

    // Ejecutar la lógica solo cuando el usuario y la sesión estén definidos
    if (user && session) {
      associateAnonymousData();
    }
  }, [user, session, router, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-8">
      <div className="container mx-auto px-4">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">
              {isLogin ? "Iniciar Sesión" : "Registro"}
            </h1>

            <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      {...register("fullName")}
                      className="mt-1"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className="mt-1"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="idNumber">Número de cédula</Label>
                    <Input
                      id="idNumber"
                      {...register("idNumber")}
                      className="mt-1"
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-destructive mt-1">{errors.idNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Número celular</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continuar con Google
              </Button>
            </div>

            <p className="text-center mt-6">
              {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  if (isLogin) {
                    router.push("/auth?register=true");
                  } else {
                    router.push("/auth");
                  }
                }}
                className="text-primary hover:underline"
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}