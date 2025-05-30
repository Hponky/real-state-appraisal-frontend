import { useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import { AppraisalFormData } from './appraisalFormSchema';
import { UseFormSetValue } from 'react-hook-form';

export interface PHFields {
  ph_sometido_ley_675?: boolean;
  ph_reglamento_interno?: boolean;
  ph_reglamento_cubre_aspectos?: boolean;
  ph_escritura_registrada?: boolean;
  ph_tipo_propiedad?: 'Residencial' | 'Comercial' | 'Mixto';
  ph_nombre_conjunto: string;
  ph_nit_copropiedad: string;
  ph_restriccion_arrendamiento: string;
  ph_cuotas_pendientes: string;
  ph_normativa_interna: string;
}

export function usePHFields(
  formData: AppraisalFormData,
  setValue: UseFormSetValue<AppraisalFormData>,
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
) {
  const phFields: PHFields = useMemo(() => {
    if (!formData.ph_aplica) {
      return {
        ph_sometido_ley_675: undefined,
        ph_reglamento_interno: undefined,
        ph_reglamento_cubre_aspectos: undefined,
        ph_escritura_registrada: undefined,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: '',
        ph_nit_copropiedad: '',
        ph_restriccion_arrendamiento: '',
        ph_cuotas_pendientes: '',
        ph_normativa_interna: '',
      };
    }
    return {
      ph_sometido_ley_675: formData.ph_sometido_ley_675,
      ph_reglamento_interno: formData.ph_reglamento_interno,
      ph_reglamento_cubre_aspectos: formData.ph_reglamento_cubre_aspectos,
      ph_escritura_registrada: formData.ph_escritura_registrada,
      ph_tipo_propiedad: formData.ph_tipo_propiedad,
      ph_nombre_conjunto: formData.ph_nombre_conjunto || '',
      ph_nit_copropiedad: formData.ph_nit_copropiedad || '',
      ph_restriccion_arrendamiento: formData.ph_restriccion_arrendamiento || '',
      ph_cuotas_pendientes: formData.ph_cuotas_pendientes || '',
      ph_normativa_interna: formData.ph_normativa_interna || '',
    };
  }, [formData]);

  const handlePHBooleanChange = useCallback((field: keyof AppraisalFormData, value: boolean) => {
    setValue(field, value, { shouldValidate: true });
  }, [setValue]);


  const handlePHStringChange = useCallback((field: keyof AppraisalFormData, value: string) => {
    setValue(field, value, { shouldValidate: true });
  }, [setValue]);

  return {
    phFields,
    handlePHBooleanChange,
    handlePHStringChange,
  };
}