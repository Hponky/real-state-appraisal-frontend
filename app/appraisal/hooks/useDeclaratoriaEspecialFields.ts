import { useCallback, useMemo } from 'react';
import { AppraisalFormData } from './appraisalFormSchema';
import { UseFormSetValue } from 'react-hook-form';

export interface ZonaDeclaratoriaEspecialFields {
  aplica?: boolean;
  tipo?: 'Histórica (Bien de Interés Cultural - BIC)' | 'Cultural' | 'Ambiental' | 'De Riesgo' | 'Otra';
  restricciones_comunes?: string[];
  restricciones_comunes_descripcion?: string;
  otras_restricciones_seleccion?: 'No aplica' | 'Sí, especificar';
  otras_restricciones_descripcion?: string;
  fuente?: string;
}

export function useDeclaratoriaEspecialFields(
  formData: AppraisalFormData,
  setValue: UseFormSetValue<AppraisalFormData>
) {
  const zonaDeclaratoriaEspecialFields: ZonaDeclaratoriaEspecialFields = useMemo(() => {
    return formData.zona_declaratoria_especial || {
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      restricciones_comunes_descripcion: '',
      otras_restricciones_seleccion: 'No aplica',
      otras_restricciones_descripcion: '',
      fuente: '',
    };
  }, [formData.zona_declaratoria_especial]);

  const handleZonaDeclaratoriaChange = useCallback(
    (
      field: 'aplica' | 'tipo' | 'fuente' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'restricciones_comunes_descripcion',
      value: string | boolean | undefined
    ) => {
      setValue(`zona_declaratoria_especial.${field}`, value, { shouldValidate: true });
    },
    [setValue]
  );

  const handleZonaDeclaratoriaRestriccionesChange = useCallback(
    (restriction: string, checked: boolean) => {
      const currentRestrictions = (formData.zona_declaratoria_especial?.restricciones_comunes || []) as string[];
      const updatedRestrictions = checked
        ? [...currentRestrictions, restriction]
        : currentRestrictions.filter((r: string) => r !== restriction);

      setValue('zona_declaratoria_especial.restricciones_comunes', updatedRestrictions, { shouldValidate: true });
    },
    [formData.zona_declaratoria_especial?.restricciones_comunes, setValue]
  );

  return {
    zonaDeclaratoriaEspecialFields,
    handleZonaDeclaratoriaChange,
    handleZonaDeclaratoriaRestriccionesChange,
  };
}