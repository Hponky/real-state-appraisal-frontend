import { useState, useCallback } from "react";
import { AppraisalFormData } from "./appraisalFormSchema";

export function useAppraisalFormState() {
  const [formData, setFormData] = useState<AppraisalFormData>({
    department: "",
    city: "",
    neighborhood: "",
    address: "",
    cadastral_certificate: "",
    property_type: "",
    built_area: 0,
    private_area: 0,
    number_of_floors: 0,
    estrato: "",
    pot_restrictions: [], // Inicializar como array vacío
    zona_declaratoria_especial: {
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      restricciones_comunes_descripcion: '',
      otras_restricciones_seleccion: 'No aplica',
      otras_restricciones_descripcion: '',
      fuente: '',
    },
    construction_year: 0,
    structural_type: "",
    facade_type: "",
    gravamenes_cargas_seleccionados: [],
    gravamenes_cargas_otros: "",
    litigios_proceso_judicial_seleccionados: [],
    litigios_proceso_judicial_otros: "",
    urban_planning: "",
    access_roads: "",
    public_services: [],
    legal_documents: [],
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
    images: [],
    ph_aplica: false,
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    ph_tipo_propiedad: undefined, // O un valor por defecto del enum si es necesario
    ph_nombre_conjunto: "",
    ph_nit_copropiedad: "",
    ph_restriccion_arrendamiento: "",
    ph_cuotas_pendientes: "",
    ph_normativa_interna: "",
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
      [field]: value === '' ? '' : Number(value)
    }));
  }, []);

  const handlePotRestrictionsChange = useCallback((
    field: 'pot_restrictions',
    value: string | string[], // Permitir string o array de strings
    checked?: boolean // Añadir checked para checkboxes
  ) => {
    setFormData(prev => {
      let updatedRestrictions: string[] = [];
      if (Array.isArray(prev.pot_restrictions)) {
        updatedRestrictions = [...prev.pot_restrictions];
      }

      if (field === 'pot_restrictions' && typeof value === 'string' && checked !== undefined) {
        if (checked) {
          updatedRestrictions.push(value);
        } else {
          updatedRestrictions = updatedRestrictions.filter(r => r !== value);
        }
      } else if (field === 'pot_restrictions' && Array.isArray(value)) {
        updatedRestrictions = value;
      } else if (field === 'pot_restrictions' && typeof value === 'string') {
        // Si es un string simple, reemplazar el array con un nuevo array que contenga solo ese string
        updatedRestrictions = [value];
      }

      return {
        ...prev,
        pot_restrictions: updatedRestrictions,
      };
    });
  }, []);

  const handleZonaDeclaratoriaChange = useCallback((
    field: 'aplica' | 'tipo' | 'restricciones_comunes_descripcion' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'fuente',
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
          restricciones_comunes: [],
          restricciones_comunes_descripcion: '',
          otras_restricciones_seleccion: 'No aplica',
          otras_restricciones_descripcion: '',
          fuente: '',
        };
      }

      return {
        ...prev,
        zona_declaratoria_especial: newZonaDeclaratoria,
      };
    });
  }, []);

  return {
    formData,
    setFormData,
    handleStringChange,
    handleBooleanChange,
    handleNumericChange,
    handlePotRestrictionsChange,
    handleZonaDeclaratoriaChange,
  };
}