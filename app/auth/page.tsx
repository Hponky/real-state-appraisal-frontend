"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail } from "lucide-react";

const authSchema = z.object({
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

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
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
        if (error) throw error;
        // Show success message and switch to login
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-8">
      <div className="container mx-auto px-4">
        <motion.div
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
                onClick={() => setIsLogin(!isLogin)}
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