import { useCallback, useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { AppraisalFormData } from "./appraisalFormSchema";
import { MaterialQualityEntry } from "./useMaterialQualityEntries";
import { appraisalApiService } from "../services/appraisalApiService";
import { supabase } from '@/lib/supabase'; // Importar cliente Supabase
import { v4 as uuidv4 } from 'uuid'; // Importar uuid

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

    const submitFormData = useCallback(async () => {
        console.log("Iniciando submitFormData..."); // Log de inicio
        clearImageErrors();
        setIsSubmitting(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.submit;
            return newErrors;
        });

        const requestId = uuidv4(); // Generar ID de solicitud
        console.log(`Generated requestId: ${requestId}`); // Log del ID
        try {
            // 1. Iniciar la creación de entrada pendiente en Supabase (sin esperar la respuesta)
            console.log("Initiating insert pending entry into Supabase (not awaiting response)..."); // Log de inicio de inserción sin await
            console.log("Content of formData (initial_data):", formData); // Log para mostrar el contenido de formData
            const dataToInsert = {
                id: requestId,
                initial_data: formData, // Guardar datos iniciales
                status: 'pending',
                created_at: new Date().toISOString(),
                // Otros campos iniciales si son necesarios
            };
            console.log("Data being sent to Supabase:", dataToInsert); // Log para mostrar los datos

            // Iniciar la operación de inserción sin await
            supabase
                .from('appraisals') // Asegúrate de que 'appraisals' es el nombre correcto de tu tabla
                .insert([dataToInsert])
                .then(({ error: insertError }) => {
                    // Este bloque se ejecutará si la promesa se resuelve (éxito o error)
                    if (insertError) {
                        console.error('Supabase Insert Operation Error (resolved promise):', insertError);
                        // Aquí podrías manejar errores de inserción que sí resuelven la promesa
                    } else {
                        console.log("Supabase insert operation promise resolved successfully.");
                    }
                })
                .catch(error => {
                    // Este bloque se ejecutará si la promesa es rechazada (ej. error de red)
                    console.error('Supabase Insert Operation Promise Rejected:', error);
                    // Aquí podrías manejar errores de red o de promesa
                });

            console.log("Supabase insert operation initiated. Proceeding with image conversion and n8n call."); // Log después de iniciar la inserción

            // Convertir imágenes a Base64
            console.log("Attempting to convert images to Base64..."); // Log antes de la conversión de imágenes
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
            console.log("Image conversion to Base64 completed."); // Log después de la conversión de imágenes
            console.log(`Converted ${base64Images.length} images to Base64.`); // Log de imágenes

            // Preparar datos para enviar a n8n (incluyendo el requestId y las imágenes)
            const dataForN8n = {
                requestId: requestId, // Pasar el ID a n8n
                ...formData, // Incluir datos del formulario
                materialQualityEntries: materialQualityEntries.filter( // Incluir detalles de calidad si existen
                    entry => entry.location.trim() !== '' || entry.qualityDescription.trim() !== ''
                ),
                imagesBase64: base64Images, // Incluir imágenes Base64
            };

            // 2. Llamar a appraisalApiService para activar n8n
            // appraisalApiService.submitAppraisal espera (requestId, formData)
            // Pasamos el requestId y el objeto dataForN8n
            console.log("Calling appraisalApiService.submitAppraisal..."); // Log antes de llamar al servicio
            await appraisalApiService.submitAppraisal(requestId, dataForN8n);

            console.log(`Appraisal initiated with ID: ${requestId}. Waiting for results via polling...`); // Log antes de iniciar polling

            // 3. Implementar Polling para esperar resultados
            const pollInterval = 3000; // Consultar cada 3 segundos
            const pollTimeout = 60 * 1000; // Esperar hasta 60 segundos
            let pollingTimer: NodeJS.Timeout;
            let timeoutTimer: NodeJS.Timeout;

            const checkStatus = async () => {
                try {
                    const response = await fetch(`/api/appraisal/status?id=${requestId}`);
                    const result = await response.json();

                    if (response.ok && result.status === 'completed') {
                        // Resultados listos, detener polling y redirigir
                        clearInterval(pollingTimer);
                        clearTimeout(timeoutTimer);
                        console.log("Appraisal completed. Redirecting to results page.");
                        // Redirigir a la página de resultados, pasando el ID para que lea de Supabase
                        router.push(`/appraisal/results?id=${requestId}`);
                    } else if (!response.ok || result.status === 'failed') {
                         // Error o fallo en el peritaje
                        clearInterval(pollingTimer);
                        clearTimeout(timeoutTimer);
                        console.error("Appraisal failed or status check error:", result.error);
                        setErrors(prev => ({ ...prev, submit: `El peritaje falló: ${result.error || 'Error desconocido'}` }));
                        setIsSubmitting(false);
                    }
                    // Si el estado es 'pending' (202 Accepted), el polling continúa
                } catch (error) {
                    console.error("Error during polling status:", error);
                    // No detener el polling por un error temporal de red, pero loguear
                }
            };

            // Iniciar polling
            pollingTimer = setInterval(checkStatus, pollInterval);

            // Configurar timeout para detener polling si tarda demasiado
            timeoutTimer = setTimeout(() => {
                clearInterval(pollingTimer);
                console.warn("Appraisal polling timed out.");
                setErrors(prev => ({ ...prev, submit: 'El peritaje está tardando demasiado. Por favor, inténtelo de nuevo más tarde.' }));
                setIsSubmitting(false);
            }, pollTimeout);


        } catch (error) {
            console.error("Error during form submission process (general catch):", error); // Log de error general
            setErrors(prev => ({ ...prev, submit: `Error general al enviar el formulario. ${error instanceof Error ? error.message : 'Por favor, intente de nuevo.'}` }));
            setIsSubmitting(false);
        }
        // Note: setIsSubmitting(false) ahora se maneja dentro del polling success/failure or timeout
    }, [formData, imageFiles, materialQualityEntries, setErrors, clearImageErrors, setIsSubmitting, router]); // Añadir router a dependencias

    return {
        submitFormData,
    };
}