import { renderHook, act } from '@testing-library/react';
import { expect } from '@jest/globals';
import { useAppraisalFormState } from '../hooks/useAppraisalFormState';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';

describe('useAppraisalFormState', () => {
  const expectedInitialFormData: AppraisalFormData = {
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
  };

  it('should initialize formData with default values', () => {
    const { result } = renderHook(() => useAppraisalFormState());
    expect(result.current.formData).toEqual(expectedInitialFormData);
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

    act(() => {
      result.current.handleStringChange('estrato', '4');
    });
    expect(result.current.formData.estrato).toBe('4');
  });

  it('should handle boolean changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleBooleanChange('ph_aplica', true);
    });
    expect(result.current.formData.ph_aplica).toBe(true);

    act(() => {
      result.current.handleBooleanChange('documento_certificado_tradicion_libertad', true);
    });
    expect(result.current.formData.documento_certificado_tradicion_libertad).toBe(true);
  });

  it('should handle nested boolean changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleNestedBooleanChange('legal_declarations.declaracion_veracidad', true);
    });
    expect(result.current.formData.legal_declarations.declaracion_veracidad).toBe(true);

    act(() => {
      result.current.handleNestedBooleanChange('legal_declarations.informacionVerazCompleta', true);
    });
    expect(result.current.formData.legal_declarations.informacionVerazCompleta).toBe(true);
  });

  it('should handle numeric changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleNumericChange('built_area', '120.5');
    });
    expect(result.current.formData.built_area).toBe(120.5);

    act(() => {
      result.current.handleNumericChange('expectedValue', '500000000');
    });
    expect(result.current.formData.expectedValue).toBe(500000000);

    act(() => {
      result.current.handleNumericChange('built_area', '');
    });
    expect(result.current.formData.built_area).toBeUndefined();

    act(() => {
      result.current.handleNumericChange('admin_fee', '150000');
    });
    expect(result.current.formData.admin_fee).toBe(150000);

    act(() => {
      result.current.handleNumericChange('admin_fee', '');
    });
    expect(result.current.formData.admin_fee).toBeUndefined();
  });

  it('should handle pot_restriccion_uso_suelo changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handlePotRestrictionObjectChange('pot_restriccion_uso_suelo', 'selected', true);
    });
    expect(result.current.formData.pot_restriccion_uso_suelo.selected).toBe(true);

    act(() => {
      result.current.handlePotRestrictionObjectChange('pot_restriccion_uso_suelo', 'description', 'Restriccion de uso de suelo');
    });
    expect(result.current.formData.pot_restriccion_uso_suelo.description).toBe('Restriccion de uso de suelo');
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
    // When 'tipo' is set, 'aplica' should automatically be true if it was false
    expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true); 

    act(() => {
      result.current.handleZonaDeclaratoriaChange('aplica', false);
    });
    expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(false);
    expect(result.current.formData.zona_declaratoria_especial?.tipo).toBeUndefined();
    expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toBeUndefined();
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

  it('should handle array changes for gravamenes_cargas_seleccionados correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleArrayChange('gravamenes_cargas_seleccionados', 'Hipoteca', true);
    });
    expect(result.current.formData.gravamenes_cargas_seleccionados).toEqual(['Hipoteca']);

    act(() => {
      result.current.handleArrayChange('gravamenes_cargas_seleccionados', 'Embargo', true);
    });
    expect(result.current.formData.gravamenes_cargas_seleccionados).toEqual(['Hipoteca', 'Embargo']);

    act(() => {
      result.current.handleArrayChange('gravamenes_cargas_seleccionados', 'Hipoteca', false);
    });
    expect(result.current.formData.gravamenes_cargas_seleccionados).toEqual(['Embargo']);
  });

  it('should handle array changes for litigios_proceso_judicial_seleccionados correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());

    act(() => {
      result.current.handleArrayChange('litigios_proceso_judicial_seleccionados', 'Demanda de Propiedad', true);
    });
    expect(result.current.formData.litigios_proceso_judicial_seleccionados).toEqual(['Demanda de Propiedad']);

    act(() => {
      result.current.handleArrayChange('litigios_proceso_judicial_seleccionados', 'Proceso de Sucesión', true);
    });
    expect(result.current.formData.litigios_proceso_judicial_seleccionados).toEqual(['Demanda de Propiedad', 'Proceso de Sucesión']);

    act(() => {
      result.current.handleArrayChange('litigios_proceso_judicial_seleccionados', 'Demanda de Propiedad', false);
    });
    expect(result.current.formData.litigios_proceso_judicial_seleccionados).toEqual(['Proceso de Sucesión']);
  });

  it('should handle image array changes correctly', () => {
    const { result } = renderHook(() => useAppraisalFormState());
    const mockFile1 = new File(['dummy content'], 'image1.jpg', { type: 'image/jpeg' });
    const mockFile2 = new File(['dummy content'], 'image2.png', { type: 'image/png' });

    act(() => {
      result.current.handleImageChange([mockFile1]);
    });
    expect(result.current.formData.images).toEqual([mockFile1]);

    act(() => {
      result.current.handleImageChange([mockFile1, mockFile2]);
    });
    expect(result.current.formData.images).toEqual([mockFile1, mockFile2]);

    act(() => {
      result.current.handleImageChange([]);
    });
    expect(result.current.formData.images).toEqual([]);
  });
});
