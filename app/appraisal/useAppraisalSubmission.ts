import { useCallback, useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { AppraisalFormData } from "./appraisalFormSchema";
import { MaterialQualityEntry } from "./useMaterialQualityEntries";
import { appraisalApiService } from "../services/appraisalApiService"; // Import the new service

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
        clearImageErrors();

        setIsSubmitting(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.submit;
            return newErrors;
        });

        try {
            const formDataToSend = new FormData();

            formDataToSend.append('departamento', formData.department);
            formDataToSend.append('ciudad', formData.city);
            formDataToSend.append('direccion', formData.address);
            formDataToSend.append('area', String(formData.area ?? 0));
            formDataToSend.append('estrato', formData.stratum);
            formDataToSend.append('administracion', String(formData.adminFee ?? 0));
            formDataToSend.append('valor_esperado', String(formData.expectedValue));
            formDataToSend.append('tipo_inmueble', formData.propertyType);

            const validEntries = materialQualityEntries.filter(
                entry => entry.location.trim() !== '' || entry.qualityDescription.trim() !== ''
            );
            if (validEntries.length > 0) {
                formDataToSend.append('material_quality_details', JSON.stringify(validEntries));
            }

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

            base64Images.forEach((base64, index) => {
                formDataToSend.append(`imagen_base64_${index}`, base64);
            });
             await appraisalApiService.submitAppraisal(formDataToSend); // Use the service

             router.push("/appraisal/results");

        } catch (error) {
            console.error("Error submitting form:", error);
            setErrors(prev => ({ ...prev, submit: `Error al enviar el formulario. ${error instanceof Error ? error.message : 'Por favor, intente de nuevo.'}` }));
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, imageFiles, materialQualityEntries, setErrors, clearImageErrors, setIsSubmitting, router]);

    return {
        submitFormData,
    };
}