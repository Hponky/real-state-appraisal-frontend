import { renderHook, act } from '@testing-library/react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { useAppraisalFormState } from '../hooks/useAppraisalFormState';

describe('useAppraisalFormState', () => {
  it('should initialize formData with default values', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    expect(result.current.formData).toEqual({
      department: "",
      city: "",
      address: "",
      area: null,
      stratum: "",
      adminFee: null,
      expectedValue: 0,
      propertyType: "",
      materialQualityEntries: [],
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
      uso_principal: undefined,
      uso_principal_otro: "",
      pot_restriccion_uso: { selectedRestrictions: [], otherRestrictions: "" },
      zona_declaratoria_especial: {
        aplica: false,
        tipo: undefined,
        restricciones_comunes: [],
        otras_restricciones: "",
        fuente: "",
      },
      licencia_urbanistica: "",
      contrato_escrito_vigente: "",
      preferencia_requisito_futuro_contrato: "",
      responsable_servicios_publicos: "",
      gravamenes_cargas: "",
      impuesto_predial_dia: "",
      litigios_proceso_judicial: "",
      acceso_servicios_publicos: "",
      condiciones_seguridad_salubridad: "",
      seguros_obligatorios_recomendables: "",
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: "",
      documento_reglamento_ph: "",
      documentos_otros: "",
      declaracion_veracidad: false,
      entendimiento_alcance_analisis: false,
    });
  });

  it('should handle string changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleStringChange('department', 'Antioquia');
    });
    expect(result.current.formData.department).toBe('Antioquia');

    act(() => {
      result.current.handleStringChange('address', 'Calle 10 #20-30');
    });
    expect(result.current.formData.address).toBe('Calle 10 #20-30');
  });

  it('should handle boolean changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleBooleanChange('ph_aplica', true);
    });
    expect(result.current.formData.ph_aplica).toBe(true);

    act(() => {
      result.current.handleBooleanChange('declaracion_veracidad', true);
    });
    expect(result.current.formData.declaracion_veracidad).toBe(true);
  });

  it('should handle numeric changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleNumericChange('area', '120.5');
    });
    expect(result.current.formData.area).toBe(120.5);

    act(() => {
      result.current.handleNumericChange('expectedValue', '500000000');
    });
    expect(result.current.formData.expectedValue).toBe(500000000);

    act(() => {
      result.current.handleNumericChange('area', '');
    });
    expect(result.current.formData.area).toBe('');
  });

  it('should handle pot_restriccion_uso.selectedRestrictions changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handlePotRestrictionsChange('selectedRestrictions', 'Restriccion A', true);
    });
    expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toEqual(['Restriccion A']);

    act(() => {
      result.current.handlePotRestrictionsChange('selectedRestrictions', 'Restriccion B', true);
    });
    expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toEqual(['Restriccion A', 'Restriccion B']);

    act(() => {
      result.current.handlePotRestrictionsChange('selectedRestrictions', 'Restriccion A', false);
    });
    expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toEqual(['Restriccion B']);
  });

  it('should handle pot_restriccion_uso.otherRestrictions changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handlePotRestrictionsChange('otherRestrictions', 'Otras restricciones de prueba');
    });
    expect(result.current.formData.pot_restriccion_uso?.otherRestrictions).toBe('Otras restricciones de prueba');
  });

  it('should handle zona_declaratoria_especial changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleZonaDeclaratoriaChange('aplica', true);
    });
    expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true);

    act(() => {
      result.current.handleZonaDeclaratoriaChange('tipo', 'Histórica (Bien de Interés Cultural - BIC)');
    });
    expect(result.current.formData.zona_declaratoria_especial?.tipo).toBe('Histórica (Bien de Interés Cultural - BIC)');
    expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true); // Should set aplica to true

    act(() => {
      result.current.handleZonaDeclaratoriaChange('aplica', false);
    });
    expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(false);
    expect(result.current.formData.zona_declaratoria_especial?.tipo).toBeUndefined();
    expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toEqual([]);
  });

  it('should handle zona_declaratoria_especial.restricciones_comunes changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleZonaDeclaratoriaRestriccionesChange('Restriccion X', true);
    });
    expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toEqual(['Restriccion X']);

    act(() => {
      result.current.handleZonaDeclaratoriaRestriccionesChange('Restriccion Y', true);
    });
    expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toEqual(['Restriccion X', 'Restriccion Y']);

    act(() => {
      result.current.handleZonaDeclaratoriaRestriccionesChange('Restriccion X', false);
    });
    expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toEqual(['Restriccion Y']);
  });
});