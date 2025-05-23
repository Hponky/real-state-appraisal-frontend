import { useCallback, useState, Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppraisalFormData } from "./appraisalFormSchema";
import { MaterialQualityEntry } from "./useMaterialQualityEntries";
import { appraisalApiService } from "../services/appraisalApiService";
import { v4 as uuidv4 } from 'uuid';
import { User, RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Importar tipos necesarios de supabase-js
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/components/supabase-provider'; // Importar el hook del proveedor


interface UseAppraisalSubmissionProps {
    formData: AppraisalFormData;
    imageFiles: File[];
    materialQualityEntries: MaterialQualityEntry[];
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    clearImageErrors: () => void;
    setIsSubmitting: Dispatch<SetStateAction<boolean>>;
}

export function useAppraisalSubmission({
    formData,
    imageFiles,
    materialQualityEntries,
    setErrors,
    clearImageErrors,
    setIsSubmitting,
}: UseAppraisalSubmissionProps) {
    const router = useRouter();
    const [requestId, setRequestId] = useState<string | null>(null); // Estado para guardar el requestId

    // Usar el hook useAuth para obtener el usuario y el estado de carga
    const { user, isLoading } = useAuth();
    // Obtener la instancia de Supabase del proveedor
    const { supabase } = useSupabase();


    const submitFormData = useCallback(async (event: React.FormEvent) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        console.log("Iniciando submitFormData...");
        clearImageErrors();
        setIsSubmitting(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.submit;
            return newErrors;
        });
        console.log("DEBUG: Form data:", formData); // Log de los datos del formulario
        console.log("DEBUG: Image files count:", imageFiles.length); // Log del número de archivos de imagen
        console.log("DEBUG: Material quality entries count:", materialQualityEntries.length); // Log del número de entradas de calidad de material

        // Esperar a que el estado de autenticación se cargue antes de proceder
        if (isLoading) {
            console.log("Auth state is loading, waiting...");
            setIsSubmitting(false); // Asegurarse de que el estado de submitting sea falso mientras carga auth
            return; // Detener la ejecución hasta que auth state esté listo
        }

        // Si no hay usuario después de que el estado de auth se cargó, algo salió mal
        if (!user) {
             console.error('No user available after auth state loaded.');
             setErrors(prev => ({ ...prev, submit: 'No se pudo obtener información del usuario después de cargar el estado de autenticación.' }));
             setIsSubmitting(false);
             return;
        }

        const newRequestId = uuidv4();
        setRequestId(newRequestId); // Guardar el requestId en el estado
        console.log(`DEBUG: Generated new requestId: ${newRequestId}`); // Log del requestId generado

        try {
            console.log(`Using user ID: ${user.id}`);

            // 1. Iniciar la creación de entrada pendiente en Supabase
            console.log(`DEBUG: user.id antes de insertar en appraisals: ${user.id}`);
            console.log("Initiating insert pending entry into Supabase...");
            const dataToInsert = {
                id: newRequestId,
                user_id: user.id, // Incluir el user_id
                initial_data: formData,
                status: 'pending',
                created_at: new Date().toISOString(),
            };
            console.log("Data being sent to Supabase:", dataToInsert);

            // Usar await para la inserción para asegurar que la fila existe antes de llamar a n8n
            console.log("DEBUG: User object before Supabase insert:", user); // Log del objeto user
            console.log("DEBUG: user.id before Supabase insert:", user?.id); // Log del user.id
            console.log("DEBUG: Attempting to insert initial data into Supabase..."); // Log antes de la inserción
            const { error: insertError } = await supabase
                .from('appraisals')
                .insert([dataToInsert]);

            if (insertError) {
                console.error('Supabase Insert Operation Error:', insertError); // Log de error de inserción
                console.error('Supabase Insert Operation Error:', insertError);
                setErrors(prev => ({ ...prev, submit: `Error al guardar el peritaje inicial: ${insertError.message}` }));
                setIsSubmitting(false);
                return; // Detener el proceso si falla la inserción
            }

            console.log("DEBUG: Supabase insert operation successful."); // Log de éxito de inserción

            // Convertir imágenes a Base64
            console.log("Attempting to convert images to Base64...");
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
            console.log("DEBUG: Image conversion to Base64 completed.");
            console.log(`DEBUG: Converted ${base64Images.length} images to Base64.`);

            // Preparar datos para enviar a n8n (incluyendo el requestId y las imágenes)
            const dataForN8n = {
                requestId: newRequestId,
                ...formData,
                materialQualityEntries: materialQualityEntries.filter(
                    entry => entry.location.trim() !== '' || entry.qualityDescription.trim() !== ''
                ),
                imagesBase64: base64Images,
            };

            // 2. Llamar a appraisalApiService para activar n8n
            console.log("DEBUG: Calling appraisalApiService.submitAppraisal..."); // Log antes de llamar al servicio
            await appraisalApiService.submitAppraisal(newRequestId, dataForN8n);
            console.log("DEBUG: appraisalApiService.submitAppraisal call finished."); // Log después de llamar al servicio

            console.log(`Appraisal initiated with ID: ${newRequestId}. Waiting for results via Realtime...`);

            // NOTA: La lógica de espera y redirección ahora se maneja en el useEffect de suscripción a Realtime.
            // setIsSubmitting(false) se manejará cuando se reciba el estado final via Realtime o en caso de error.

        } catch (error) {
            console.error("Error during form submission process (general catch):", error);
            setErrors(prev => ({ ...prev, submit: `Error general al enviar el formulario. ${error instanceof Error ? error.message : 'Por favor, intente de nuevo.'}` }));
            setIsSubmitting(false);
        }
    }, [formData, imageFiles, materialQualityEntries, setErrors, clearImageErrors, setIsSubmitting, router, user, supabase]); // Añadir user y supabase a dependencias

    // useEffect para manejar la suscripción a Supabase Realtime
    useEffect(() => {
        if (!requestId || !supabase) return; // No suscribirse si no hay requestId o supabase cliente

        console.log(`Subscribing to Supabase changes for requestId: ${requestId}`);

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
                    console.log('DEBUG: Realtime UPDATE callback triggered.'); // Nuevo log aquí
                    console.log('DEBUG: Realtime UPDATE received:', payload);
                    const updatedAppraisal = payload.new;

                    if (updatedAppraisal && updatedAppraisal.status === 'completed') {
                        console.log("DEBUG: Appraisal completed via Realtime. Redirecting...");
                        console.log("Appraisal completed via Realtime. Redirecting...");
                        console.log(`DEBUG: Attempting to redirect to: /appraisal/results?id=${requestId}`); // Log antes de push
                        router.push(`/appraisal/results?id=${requestId}`);
                        console.log("DEBUG: router.push called."); // Log después de push
                        setIsSubmitting(false); // Finalizar estado de submitting
                    } else if (updatedAppraisal && updatedAppraisal.status === 'failed') {
                         console.error("DEBUG: Appraisal failed via Realtime:", updatedAppraisal.error);
                         setErrors(prev => ({ ...prev, submit: `El peritaje falló: ${updatedAppraisal.error || 'Error desconocido'}` }));
                         setIsSubmitting(false); // Finalizar estado de submitting
                    }
                }
            )
             .subscribe((status, err) => { // Eliminar anotaciones de tipo explícitas
                 if (status === 'SUBSCRIBED') {
                     console.log(`DEBUG: Subscribed to channel appraisal_status_${requestId}`);
                 } else if (status === 'CHANNEL_ERROR') { // Log para errores del canal
                      console.error('DEBUG: Supabase Realtime Channel Error:', err);
                 } else {
                      console.log(`DEBUG: Supabase Realtime Subscription status changed: ${status}`); // Log para otros estados
                 }
                 if (err) {
                     console.error('DEBUG: Supabase Realtime Subscription Error:', err);
                     setErrors(prev => ({ ...prev, submit: `Error en la suscripción en tiempo real: ${err.message}` }));
                     setIsSubmitting(false); // Finalizar estado de submitting en caso de error de suscripción
                 }
             });

        // Función de limpieza para desuscribirse cuando el componente se desmonte o requestId cambie
        return () => {
            console.log(`DEBUG: Unsubscribing from channel appraisal_status_${requestId}`);
            supabase.removeChannel(channel);
        };

    }, [requestId, router, setErrors, setIsSubmitting, supabase]); // Añadir supabase a dependencias

    return {
        submitFormData,
    };
}