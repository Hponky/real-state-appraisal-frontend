import { useState, useCallback } from 'react';
import { AppraisalFormData } from './appraisalFormSchema';
import Swal from 'sweetalert2';
import { UseFormSetValue } from 'react-hook-form';

export function useLegalDeclarations(
  formData: AppraisalFormData,
  setValue: UseFormSetValue<AppraisalFormData>
) {
  const [showLegalSections, setShowLegalSectionsState] = useState(true);

  const handleLegalBooleanChange = useCallback(
    (field: keyof AppraisalFormData['legal_declarations'], value: boolean) => {
      setValue(`legal_declarations.${field}`, value, { shouldValidate: true });
    },
    [setValue]
  );

  const setShowLegalSections = useCallback(async (value: boolean) => {
    if (!value) {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Al ocultar las secciones legales, los campos relacionados no serán validados y se enviarán con valores por defecto (vacíos o falsos).',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ocultar',
        cancelButtonText: 'No, mantener visibles',
      });

      if (result.isConfirmed) {
        setShowLegalSectionsState(false);
        // Reset legal fields in formData if they are being hidden
        setValue('ph_aplica', false);
        setValue('ph_sometido_ley_675', false);
        setValue('ph_reglamento_interno', false);
        setValue('ph_reglamento_cubre_aspectos', false);
        setValue('ph_escritura_registrada', false);
        setValue('ph_tipo_propiedad', undefined);
        setValue('ph_nombre_conjunto', "");
        setValue('ph_nit_copropiedad', "");
        setValue('ph_restriccion_arrendamiento', "");
        setValue('ph_cuotas_pendientes', "");
        setValue('ph_normativa_interna', "");
        setValue('pot_restrictions', []);
        setValue('pot_otras_restricciones_descripcion', '');
        setValue('zona_declaratoria_especial', { aplica: false, tipo: undefined, restricciones_comunes: [], restricciones_comunes_descripcion: '', otras_restricciones_seleccion: "No aplica", otras_restricciones_descripcion: '', fuente: '' });
        setValue('gravamenes_cargas_seleccionados', []);
        setValue('gravamenes_cargas_otros', '');
        setValue('litigios_proceso_judicial_seleccionados', []);
        setValue('litigios_proceso_judicial_otros', '');
        setValue('documento_certificado_tradicion_libertad', false);
        setValue('documento_escritura_publica', false);
        setValue('documento_recibo_impuesto_predial', false);
        setValue('documento_paz_salvo_administracion', false);
        setValue('documento_reglamento_ph', false);
        setValue('documentos_otros', '');
        setValue('legal_declarations', {
          declaracion_veracidad: false,
          entendimiento_alcance_analisis: false,
          declaracion_propiedad_exclusiva: false,
          declaracion_uso_previsto: false,
          declaracion_cumplimiento_normas: false,
          declaracion_sin_litigios: false,
          declaracion_servidumbres: false,
          declaracion_sin_afectaciones: false,
          declaracion_impuestos_pagados: false,
          declaracion_sin_deudas_asociacion: false,
          declaracion_informacion_completa: false,
        });
      }
    } else {
      setShowLegalSectionsState(true);
    }
  }, [setValue]);

  return {
    showLegalSections,
    setShowLegalSections,
    handleLegalBooleanChange,
  };
}