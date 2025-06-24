import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppraisalFormData, AppraisalFormDataSchema } from "./appraisalFormSchema";
import { useImageHandler } from "./useImageHandler";
import { useMaterialQualityEntries } from "./useMaterialQualityEntries";
import { useAppraisalSubmission } from "./useAppraisalSubmission";
import { useLocationData } from "./useLocationData";
import { useAppraisalFormValidation } from "./useAppraisalFormValidation";
import { useFormErrorManagement } from "./useFormErrorManagement";
import { usePHFields } from "./usePHFields";
import { useDeclaratoriaEspecialFields } from "./useDeclaratoriaEspecialFields";
import { useLegalDeclarations } from "./useLegalDeclarations";
import { useEffect, useState } from "react";
import { getPreFilledAppraisalFormData, getPreFilledMaterialQualityEntries } from "../utils/appraisalFormFiller";

export default function useAppraisalForm() {
  const router = useRouter();

  const methods = useForm<AppraisalFormData>({
    resolver: zodResolver(AppraisalFormDataSchema),
    defaultValues: {
      department: "",
      city: "",
      address: "",
      built_area: 0, // Inicializar built_area con 0
      documento_ficha_predial_catastral: false,
      property_type: "",
      estrato: "1", // Inicializar con un valor válido para el estrato
      pot_restriccion_uso_suelo: { selected: false, description: '' },
      pot_restriccion_edificabilidad: { selected: false, description: '' },
      pot_restriccion_altura: { selected: false, description: '' },
      pot_afectacion_via_publica: { selected: false, description: '' },
      pot_afectacion_ronda_hidrica: { selected: false, description: '' },
      pot_afectacion_infraestructura_servicios_publicos: { selected: false, description: '' },
      pot_otra_restriccion_pot: { selected: false, description: '' },
      zona_declaratoria_especial: {
        aplica: false,
        tipo: undefined,
        restricciones_comunes: [],
        restricciones_comunes_descripcion: '',
        otras_restricciones_seleccion: 'No aplica',
        otras_restricciones_descripcion: '',
        fuente: '',
      },
      gravamenes_cargas_seleccionados: [],
      gravamenes_cargas_otros: "",
      litigios_proceso_judicial_seleccionados: [],
      litigios_proceso_judicial_otros: "",
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: false,
      documento_reglamento_ph: false,
      documentos_otros: '',
      legal_declarations: {
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
      },
      expectedValue: 0,
      images: [new File([], 'initial_dummy.jpg')], // Inicializar images con un archivo dummy
      ph_aplica: false,
      ph_sometido_ley_675: false,
      ph_reglamento_interno: false,
      ph_reglamento_cubre_aspectos: false,
      ph_escritura_registrada: false,
      ph_tipo_propiedad: undefined,
      ph_nombre_conjunto: "",
      ph_nit_copropiedad: "",
      ph_restriccion_arrendamiento: "",
      ph_cuotas_pendientes: "",
      ph_normativa_interna: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
    getValues,
    trigger,
  } = methods;

  const [useTestValues, setUseTestValues] = useState(false); // Nuevo estado para el switch

  useEffect(() => {
    if (useTestValues) {
      const testData = getPreFilledAppraisalFormData();
      for (const key in testData) {
        if (testData.hasOwnProperty(key)) {
          // @ts-ignore
          setValue(key, testData[key], { shouldValidate: true });
        }
      }
    }
  }, [useTestValues, setValue]);

  const formData = watch();

  // Función para normalizar los errores de react-hook-form a un Record<string, string>
  const normalizeErrors = (errors: typeof formErrors): Record<string, string> => {
    const normalized: Record<string, string> = {};
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const error = errors[key as keyof typeof errors];
        if (error && error.message) {
          normalized[key] = error.message;
        }
      }
    }
    return normalized;
  };

  const errors = normalizeErrors(formErrors);

  const { departments, cities, isLoadingPlaces, placesError } = useLocationData(
    formData.department || ""
  );

  const {
    images,
    imageFiles,
    imageErrors,
    handleImageUpload,
    removeImage,
    clearImageErrors,
  } = useImageHandler();

  // Actualizar el campo 'images' del formulario con los objetos File reales
  useEffect(() => {
    setValue('images', imageFiles, { shouldValidate: true });
  }, [imageFiles, setValue]);

  const { setErrors } = useFormErrorManagement();

  const {
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry,
  } = useMaterialQualityEntries(setErrors);

  const { showLegalSections, setShowLegalSections } = useLegalDeclarations(formData, setValue);
  const { handlePHBooleanChange, handlePHStringChange } = usePHFields(formData, setValue, setErrors);
  const { handleZonaDeclaratoriaChange, handleZonaDeclaratoriaRestriccionesChange } = useDeclaratoriaEspecialFields(formData, setValue);

  const { validateForm } = useAppraisalFormValidation(
    formData,
    imageFiles,
    imageErrors,
    showLegalSections,
    setErrors,
    clearImageErrors
  );

  const { submitFormData, isSubmitting, setIsSubmitting } = useAppraisalSubmission({
    formData,
    imageFiles,
    materialQualityEntries,
    setErrors,
    clearImageErrors,
    setValue, // Pasar setValue
    trigger,  // Pasar trigger
  });

  // Guardar el requestId en localStorage si existe y no hay un usuario autenticado
  useEffect(() => {
    if (formData.requestId && !methods.formState.isSubmitting) {
      const anonymousSessionId = localStorage.getItem('anonymous_session_id');
      if (!anonymousSessionId) {
        localStorage.setItem('anonymous_session_id', formData.requestId);
      }
    }
  }, [formData.requestId, methods.formState.isSubmitting]);

  return {
    methods,
    formData,
    images,
    imageFiles,
    errors,
    isSubmitting,
    handleImageUpload,
    removeImage,
    submitFormData,
    departments,
    cities,
    isLoadingPlaces,
    placesError,
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry,
    handleNumericChange: (field: keyof AppraisalFormData, value: string | number) => setValue(field, value, { shouldValidate: true }),
    handleStringChange: (field: keyof AppraisalFormData, value: string) => setValue(field, value, { shouldValidate: true }),
    handleBooleanChange: (field: keyof AppraisalFormData, value: boolean) => setValue(field, value, { shouldValidate: true }),
    handlePotRestrictionChange: (field: keyof AppraisalFormData, selected: boolean, description?: string) => {
      setValue(field, { selected, description }, { shouldValidate: true });
    },
    handlePHBooleanChange,
    handlePHStringChange,
    handleZonaDeclaratoriaChange,
    handleZonaDeclaratoriaRestriccionesChange,
    showLegalSections,
    setShowLegalSections,
    handleLegalBooleanChange: (field: keyof AppraisalFormData['legal_declarations'], value: boolean) => setValue(`legal_declarations.${field}`, value, { shouldValidate: true }),
    validateForm,
    useTestValues, // Exponer el estado del switch
    setUseTestValues, // Exponer la función para cambiar el estado del switch
  };
}
