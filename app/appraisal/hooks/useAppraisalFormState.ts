import { useState, useCallback } from "react";
import { AppraisalFormData } from "./appraisalFormSchema";

export function useAppraisalFormState() {
  const [formData, setFormData] = useState<AppraisalFormData>({
    department: "",
    city: "",
    address: "",
    documento_ficha_predial_catastral: false,
    property_type: undefined,
    estrato: "",
    built_area: undefined,
    pot_restriccion_uso_suelo: { selected: false, description: undefined },
    pot_restriccion_edificabilidad: { selected: false, description: undefined },
    pot_restriccion_altura: { selected: false, description: undefined },
    pot_afectacion_via_publica: { selected: false, description: undefined },
    pot_afectacion_ronda_hidrica: { selected: false, description: undefined },
    pot_afectacion_infraestructura_servicios_publicos: { selected: false, description: undefined },
    pot_otra_restriccion_pot: { selected: false, description: undefined },
    pot_otras_restricciones_descripcion: undefined,
    zona_declaratoria_especial: {
      aplica: false,
      tipo: undefined,
      restricciones_comunes: undefined,
      restricciones_comunes_descripcion: undefined,
      otras_restricciones_seleccion: "No aplica",
      otras_restricciones_descripcion: undefined,
      fuente: undefined,
      declaratoriaImponeObligaciones: undefined,
    },
    contrato_escrito_vigente: undefined,
    preferencia_requisito_futuro_contrato: undefined,
    responsable_servicios_publicos: undefined,
    gravamenes_cargas_seleccionados: undefined,
    gravamen_hipoteca_description: undefined,
    gravamen_embargo_description: undefined,
    gravamen_servidumbre_description: undefined,
    gravamen_prenda_description: undefined,
    gravamen_usufructo_description: undefined,
    gravamenes_cargas_otros: undefined,
    litigios_proceso_judicial_seleccionados: undefined,
    litigio_demanda_propiedad_description: undefined,
    litigio_proceso_sucesion_description: undefined,
    litigio_disputa_linderos_description: undefined,
    litigio_ejecucion_hipotecaria_description: undefined,
    litigios_proceso_judicial_otros: undefined,
    impuestoPredialAlDia: undefined,
    acceso_servicios_publicos: undefined,
    serviciosConectadosFuncionando: undefined,
    deudasServiciosPublicos: undefined,
    condiciones_seguridad_salubridad: undefined,
    cumpleNormasSismoresistencia: undefined,
    riesgosEvidentesHabitabilidad: undefined,
    riesgosEvidentesHabitabilidadDescription: undefined,
    seguros_obligatorios_recomendables: undefined,
    cuentaPolizaSeguroVigente: undefined,
    documento_certificado_tradicion_libertad: false,
    documento_escritura_publica: false,
    documento_recibo_impuesto_predial: false,
    documento_paz_salvo_administracion: false,
    documento_reglamento_ph: false,
    documentos_otros: undefined,
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
      informacionVerazCompleta: false,
      entendimientoAnalisisLegal: false,
      autorizacionTratamientoDatos: false,
    },
    expectedValue: 0,
    images: [],
    admin_fee: undefined,
    ph_aplica: false,
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    reglamentoPropiedadHorizontalInscrito: undefined,
    deudasCuotasAdministracion: undefined,
    ph_tipo_propiedad: undefined,
    ph_nombre_conjunto: undefined,
    ph_nit_copropiedad: undefined,
    ph_restriccion_arrendamiento: undefined,
    ph_cuotas_pendientes: undefined,
    ph_normativa_interna: undefined,
  });

  const handleStringChange = useCallback((field: keyof AppraisalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleBooleanChange = useCallback((field: keyof AppraisalFormData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  }, []);

  const handleNumericChange = useCallback((field: keyof AppraisalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : Number(value)
    }));
  }, []);

  // Generic handler for nested boolean changes (e.g., legal_declarations.field)
  const handleNestedBooleanChange = useCallback((path: string, checked: boolean) => {
    setFormData(prev => {
      const keys = path.split('.');
      let updatedData = { ...prev } as any; // Use any for dynamic path traversal
      let currentLevel = updatedData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!currentLevel[key]) {
          currentLevel[key] = {}; // Initialize if undefined
        }
        currentLevel = currentLevel[key];
      }
      currentLevel[keys[keys.length - 1]] = checked;
      return updatedData;
    });
  }, []);

  // Generic handler for array changes (add/remove string from array)
  const handleArrayChange = useCallback((field: keyof AppraisalFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] || []) as string[];
      let updatedArray: string[];

      if (checked) {
        updatedArray = [...currentArray, value];
      } else {
        updatedArray = currentArray.filter(item => item !== value);
      }

      return {
        ...prev,
        [field]: updatedArray,
      };
    });
  }, []);

  // Handler for image array changes
  const handleImageChange = useCallback((files: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: files,
    }));
  }, []);

  // Refactored handler for PotRestrictionSchema objects
  const handlePotRestrictionObjectChange = useCallback((
    field: 'pot_restriccion_uso_suelo' | 'pot_restriccion_edificabilidad' | 'pot_restriccion_altura' |
    'pot_afectacion_via_publica' | 'pot_afectacion_ronda_hidrica' | 'pot_afectacion_infraestructura_servicios_publicos' |
    'pot_otra_restriccion_pot',
    subField: 'selected' | 'description',
    value: boolean | string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value,
      },
    }));
  }, []);


  const handleZonaDeclaratoriaChange = useCallback((
    field: 'aplica' | 'tipo' | 'restricciones_comunes_descripcion' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'fuente' | 'declaratoriaImponeObligaciones',
    value: boolean | string | undefined
  ) => {
    setFormData(prev => {
      const currentZonaDeclaratoria = prev.zona_declaratoria_especial;

      let newZonaDeclaratoria = {
        ...currentZonaDeclaratoria,
        [field]: value,
      };

      if (field === 'aplica' && value === false) {
        newZonaDeclaratoria = {
          aplica: false,
          tipo: undefined,
          restricciones_comunes: undefined, // Set to undefined as per schema
          restricciones_comunes_descripcion: undefined, // Set to undefined as per schema
          otras_restricciones_seleccion: 'No aplica',
          otras_restricciones_descripcion: undefined, // Set to undefined as per schema
          fuente: undefined, // Set to undefined as per schema
          declaratoriaImponeObligaciones: undefined, // Set to undefined as per schema
        };
      } else if (field === 'tipo' && value !== undefined && !newZonaDeclaratoria.aplica) {
        // If 'tipo' is set, 'aplica' should automatically be true
        newZonaDeclaratoria.aplica = true;
      }

      return {
        ...prev,
        zona_declaratoria_especial: newZonaDeclaratoria,
      };
    });
  }, []);

  // Handler for zona_declaratoria_especial.restricciones_comunes array
  const handleZonaDeclaratoriaRestriccionesChange = useCallback((value: string, checked: boolean) => {
    setFormData(prev => {
      const currentRestrictions = prev.zona_declaratoria_especial?.restricciones_comunes || [];
      let updatedRestrictions: string[];

      if (checked) {
        updatedRestrictions = [...currentRestrictions, value];
      } else {
        updatedRestrictions = currentRestrictions.filter(item => item !== value);
      }

      return {
        ...prev,
        zona_declaratoria_especial: {
          ...prev.zona_declaratoria_especial,
          restricciones_comunes: updatedRestrictions,
        },
      };
    });
  }, []);


  return {
    formData,
    setFormData,
    handleStringChange,
    handleBooleanChange,
    handleNumericChange,
    handlePotRestrictionObjectChange, // Renamed
    handleZonaDeclaratoriaChange,
    handleNestedBooleanChange, // New
    handleArrayChange, // New
    handleImageChange, // New
    handleZonaDeclaratoriaRestriccionesChange, // New
  };
}
