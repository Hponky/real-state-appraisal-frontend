import { useState, useCallback, useMemo } from 'react';
import { AppraisalFormDataSchema, AppraisalFormData } from './appraisalFormSchema';
import { ZodError } from 'zod';

interface FormErrors {
  [key: string]: string;
}

export const useAppraisalFormValidation = (
  formData: AppraisalFormData,
  imageFiles: File[],
  imageErrors: string | null,
  showLegalSections: boolean,
  setFormErrors: (errors: FormErrors) => void,
  clearImageErrors: () => void
) => {
  const validateForm = useCallback(() => {
    let currentErrors: FormErrors = {};
    let isValid = true;

    // 1. Validate with Zod schema
    const zodResult = AppraisalFormDataSchema.safeParse(formData);
    if (!zodResult.success) {
      isValid = false;
      (zodResult.error as ZodError).errors.forEach((err) => {
        if (err.path.length > 0) {
          currentErrors[err.path[0]] = err.message;
        }
      });
    }

    // 2. Validate image files
    if (imageFiles.length === 0) {
      currentErrors.images = 'Cargue al menos una imagen';
      isValid = false;
    } else if (imageFiles.length > 30) {
      currentErrors.images = 'Puede cargar un máximo de 30 imágenes';
      isValid = false;
    } else if (imageErrors) {
      currentErrors.images = imageErrors;
      isValid = false;
    } else {
      clearImageErrors();
    }

    // 3. Conditional validation for Section H (Legal Declarations)
    // Las validaciones para declaracion_veracidad y entendimiento_alcance_analisis han sido eliminadas
    // ya que estas propiedades no existen en el esquema actual.

    // 4. Conditional validation for Section B (Propiedad Horizontal)
    if (formData.ph_aplica) {
      if (!formData.ph_tipo_propiedad) {
        currentErrors.ph_tipo_propiedad = 'Seleccione el tipo de propiedad en Propiedad Horizontal.';
        isValid = false;
      }
      if (!formData.ph_nombre_conjunto) {
        currentErrors.ph_nombre_conjunto = 'Ingrese el nombre del conjunto/edificio.';
        isValid = false;
      }
      if (!formData.ph_nit_copropiedad) {
        currentErrors.ph_nit_copropiedad = 'Ingrese el NIT de la copropiedad.';
        isValid = false;
      }
      if (!formData.ph_restriccion_arrendamiento) {
        currentErrors.ph_restriccion_arrendamiento = 'Especifique las restricciones de arrendamiento.';
        isValid = false;
      }
      if (!formData.ph_cuotas_pendientes) {
        currentErrors.ph_cuotas_pendientes = 'Especifique las cuotas de administración pendientes.';
        isValid = false;
      }
      if (!formData.ph_normativa_interna) {
        currentErrors.ph_normativa_interna = 'Especifique la normativa interna relevante.';
        isValid = false;
      }
    }

    setFormErrors(currentErrors);
    return isValid;
  }, [formData, imageFiles, imageErrors, setFormErrors, clearImageErrors]);

  return useMemo(() => ({
    validateForm,
  }), [validateForm]);
};
