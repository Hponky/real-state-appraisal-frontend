import { useCallback, useState, Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppraisalFormData } from "./appraisalFormSchema";
import { MaterialQualityEntry } from "../types/appraisal-results";
import { appraisalApiService, AppraisalSubmissionPayload } from "../../services/appraisalApiService";
import { v4 as uuidv4 } from 'uuid';
import { User, RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Importar tipos necesarios de supabase-js
import { useAuth } from '@/hooks/useAuth'; // Importar el hook useAuth
import { useSupabase } from '@/components/supabase-provider'; // Importar el hook del proveedor
import { useToast } from "@/hooks/use-toast"; // Importar useToast


interface UseAppraisalSubmissionProps {
    formData: AppraisalFormData;
    imageFiles: File[];
    materialQualityEntries: MaterialQualityEntry[];
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    clearImageErrors: () => void;
    setValue: (name: any, value: any, options?: { shouldValidate?: boolean; shouldDirty?: boolean; shouldTouch?: boolean }) => void;
    trigger: (name?: any | readonly any[]) => Promise<boolean>;
}

export function useAppraisalSubmission({
    formData,
    imageFiles,
    materialQualityEntries,
    setErrors,
    clearImageErrors,
    setValue,
    trigger,
}: UseAppraisalSubmissionProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false); // Declarar isSubmitting como estado local
    const [requestId, setRequestId] = useState<string | null>(null); // Estado para guardar el requestId
    const { toast } = useToast(); // Obtener la función toast

    // Usar el hook useAuth para obtener el usuario, la sesión y el estado de carga
    const { user, session, isLoading } = useAuth();
    // Obtener la instancia de Supabase del proveedor
    const { supabase } = useSupabase();


    const submitFormData = useCallback(async (data: AppraisalFormData) => {
        // event.preventDefault() no es necesario aquí, handleSubmit de react-hook-form ya lo maneja
        clearImageErrors();
        setIsSubmitting(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.submit;
            return newErrors;
        });

        // Esperar a que el estado de autenticación se cargue antes de proceder
        if (isLoading) {
            setIsSubmitting(false); // Asegurarse de que el estado de submitting sea falso mientras carga auth
            return; // Detener la ejecución hasta que auth state esté listo
        }

        // Si no hay usuario después de que el estado de auth se cargó, algo salió mal
        // Si no hay usuario, el peritaje se considera anónimo.
        // El user_id se establecerá en null en la base de datos.
        // La asociación se hará al iniciar sesión.

        const newRequestId = uuidv4();
        setRequestId(newRequestId); // Guardar el requestId en el estado

        try {

            // 1. Iniciar la creación de entrada pendiente en Supabase
            const isAnonymous = user?.is_anonymous ?? true;

            const dataToInsert = {
                id: newRequestId,
                user_id: isAnonymous ? null : user?.id,
                anonymous_session_id: isAnonymous ? user?.id : null,
                form_data: formData,
                result_data: null,
                status: 'pending',
                created_at: new Date().toISOString(),
            };

            // Usar await para la inserción para asegurar que la fila existe antes de llamar a n8n
            const { error: insertError } = await supabase
                .from('appraisals')
                .insert([dataToInsert]);

            if (insertError) {
                console.error('Supabase Insert Operation Error:', insertError); // Log de error de inserción
                toast({
                  title: "Error al guardar peritaje",
                  description: `Error al guardar el peritaje inicial: ${insertError.message}`,
                  variant: "destructive",
                });
                setIsSubmitting(false);
                return; // Detener el proceso si falla la inserción
            }

            if (isAnonymous && user?.id) {
                localStorage.setItem('anonymous_session_id', user.id);
            }

            // Convertir imágenes a Base64
            const base64Images = await Promise.all(
                imageFiles.map(file => {
                    return new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = (error) => reject(new Error(`Error reading file ${file.name}: ${error}`));
                        reader.readAsDataURL(file);
                    });
                })
            );

const dataForN8n: AppraisalSubmissionPayload = {
    requestId: newRequestId,
    department: formData.department,
    city: formData.city,
    address: formData.address,
    ...(() => {
        // Exclude images, department, city, and address from the spread 'rest'
        const { images, department, city, address, ...rest } = formData;
        return rest;
    })(),
    imagesBase64: base64Images,
    materialQualityEntries: materialQualityEntries.filter(
        entry => entry.location?.trim() !== '' || entry.qualityDescription?.trim() !== ''
    ),
};

            // 2. Llamar a appraisalApiService para activar n8n
            // Si no hay sesión, no se envía el token de autenticación.
            // El backend debe estar preparado para manejar esto para peritajes anónimos.
            // Guardar el requestId en localStorage para asociarlo después del login.
            // La lógica para guardar el anonymousSessionId ya se maneja arriba.
            // No se necesita más lógica de almacenamiento local aquí.

            await appraisalApiService.submitAppraisal(newRequestId, dataForN8n, session?.access_token || null);

            router.push(`/appraisal/results?id=${newRequestId}`);

            // NOTA: La lógica de espera y redirección ahora se maneja en el useEffect de suscripción a Realtime.
            // setIsSubmitting(false) se manejará cuando se reciba el estado final via Realtime o en caso de error.

        } catch (error: any) {
            toast({
              title: "Error durante el envío",
              description: error.message,
              variant: "destructive",
            });
            setIsSubmitting(false);
        }
    }, [formData, imageFiles, materialQualityEntries, setErrors, clearImageErrors, user, session, supabase, isLoading, toast]);

    // useEffect para manejar la suscripción a Supabase Realtime
    useEffect(() => {
        if (!requestId || !supabase) return; // No suscribirse si no hay requestId o supabase cliente


        const channel = supabase
            .channel(`appraisal_status_${requestId}`) // Nombre único del canal
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE', // Escuchar solo eventos de actualización
                    schema: 'public',
                    table: 'appraisals',
                    filter: `id=eq.${requestId}`, // Filtrar por el requestId específico
                },
                (payload: RealtimePostgresChangesPayload<any>) => { // Añadir anotación de tipo
                    const updatedAppraisal = payload.new;

                    if (updatedAppraisal && updatedAppraisal.status === 'completed') {
                        toast({
                          title: "Peritaje completado",
                          description: "El peritaje se ha completado exitosamente.",
                        });
                        setIsSubmitting(false); // Finalizar estado de submitting
                    } else if (updatedAppraisal && updatedAppraisal.status === 'failed') {
                         console.error("DEBUG: Appraisal failed via Realtime:", updatedAppraisal.error);
                         toast({
                           title: "Peritaje fallido",
                           description: `El peritaje falló: ${updatedAppraisal.error || 'Error desconocido'}`,
                           variant: "destructive",
                         });
                         setIsSubmitting(false); // Finalizar estado de submitting
                    }
                }
            )
             .subscribe((status, err: any) => { // Añadir anotación de tipo para err
                 if (status === 'SUBSCRIBED') {
                 } else if (status === 'CHANNEL_ERROR') { // Log para errores del canal
                      console.error('DEBUG: Supabase Realtime Channel Error:', err);
                 } else {
                 }
                 if (err) {
                     console.error('DEBUG: Supabase Realtime Subscription Error:', err);
                     toast({
                       title: "Error de suscripción",
                       description: `Error en la suscripción en tiempo real: ${err.message}`,
                       variant: "destructive",
                     });
                     setIsSubmitting(false); // Finalizar estado de submitting en caso de error de suscripción
                 }
             });

        // Función de limpieza para desuscribirse cuando el componente se desmonte o requestId cambie
        return () => {
            supabase.removeChannel(channel);
        };

    }, [requestId, router, setErrors, setIsSubmitting, supabase]); // Añadir supabase a dependencias

    return {
        submitFormData,
        isSubmitting,
        setIsSubmitting,
    };
}
