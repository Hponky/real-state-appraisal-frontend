import { renderHook, act } from '@testing-library/react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { usePHFields } from '../hooks/usePHFields';

// Mock de File para los tests
const mockFile = new File(['dummy content'], 'image.jpg', { type: 'image/jpeg' });

describe('usePHFields', () => {
  const mockSetFormData = jest.fn();
  const mockSetErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default values when ph_aplica is false', () => {
    const formData: AppraisalFormData = {
      department: "Cundinamarca",
      city: "Bogotá",
      address: "Calle 123 #45-67",
      documento_ficha_predial_catastral: false,
      property_type: "Apartamento",
      estrato: "4",
      built_area: 100,
      pot_restriccion_uso_suelo: { selected: false },
      pot_restriccion_edificabilidad: { selected: false },
      pot_restriccion_altura: { selected: false },
      pot_afectacion_via_publica: { selected: false },
      pot_afectacion_ronda_hidrica: { selected: false },
      pot_afectacion_infraestructura_servicios_publicos: { selected: false },
      pot_otra_restriccion_pot: { selected: false },
      zona_declaratoria_especial: {
        aplica: false,
        otras_restricciones_seleccion: "No aplica",
      },
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
      expectedValue: 500000000,
      images: [mockFile],
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: false,
      documento_reglamento_ph: false,
      ph_aplica: false,
      ph_sometido_ley_675: false,
      ph_reglamento_interno: false,
      ph_reglamento_cubre_aspectos: false,
      ph_escritura_registrada: false,
      reglamentoPropiedadHorizontalInscrito: false,
      deudasCuotasAdministracion: false,
      ph_tipo_propiedad: undefined,
      ph_nombre_conjunto: undefined,
      ph_nit_copropiedad: undefined,
      ph_restriccion_arrendamiento: undefined,
      ph_cuotas_pendientes: undefined,
      ph_normativa_interna: undefined,
    };
    const { result } = renderHook(() => usePHFields(formData, mockSetFormData, mockSetErrors));

    expect(result.current.phFields).toEqual({
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
    });
  });

  it('should return formData values when ph_aplica is true', () => {
    const formData: AppraisalFormData = {
      department: "Cundinamarca",
      city: "Bogotá",
      address: "Calle 123 #45-67",
      documento_ficha_predial_catastral: false,
      property_type: "Apartamento",
      estrato: "4",
      built_area: 100,
      pot_restriccion_uso_suelo: { selected: false },
      pot_restriccion_edificabilidad: { selected: false },
      pot_restriccion_altura: { selected: false },
      pot_afectacion_via_publica: { selected: false },
      pot_afectacion_ronda_hidrica: { selected: false },
      pot_afectacion_infraestructura_servicios_publicos: { selected: false },
      pot_otra_restriccion_pot: { selected: false },
      zona_declaratoria_especial: {
        aplica: false,
        otras_restricciones_seleccion: "No aplica",
      },
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
      expectedValue: 500000000,
      images: [mockFile],
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: false,
      documento_reglamento_ph: false,
      ph_aplica: true,
      ph_sometido_ley_675: true,
      ph_reglamento_interno: false,
      ph_reglamento_cubre_aspectos: true,
      ph_escritura_registrada: false,
      reglamentoPropiedadHorizontalInscrito: true,
      deudasCuotasAdministracion: false,
      ph_tipo_propiedad: 'Residencial',
      ph_nombre_conjunto: 'Conjunto Residencial',
      ph_nit_copropiedad: '123456789',
      ph_restriccion_arrendamiento: 'No se permite subarrendar',
      ph_cuotas_pendientes: 'No',
      ph_normativa_interna: 'Reglamento de convivencia',
    };

    const { result } = renderHook(() => usePHFields(formData, mockSetFormData, mockSetErrors));

    expect(result.current.phFields).toEqual(expect.objectContaining({
      ph_sometido_ley_675: true,
      ph_reglamento_interno: false,
      ph_tipo_propiedad: 'Residencial',
      ph_nombre_conjunto: 'Conjunto Residencial',
    }));
  });

  it('should handle ph_sometido_ley_675 change', () => {
    const formData: AppraisalFormData = {
      department: "Cundinamarca",
      city: "Bogotá",
      address: "Calle 123 #45-67",
      documento_ficha_predial_catastral: false,
      property_type: "Apartamento",
      estrato: "4",
      built_area: 100,
      pot_restriccion_uso_suelo: { selected: false },
      pot_restriccion_edificabilidad: { selected: false },
      pot_restriccion_altura: { selected: false },
      pot_afectacion_via_publica: { selected: false },
      pot_afectacion_ronda_hidrica: { selected: false },
      pot_afectacion_infraestructura_servicios_publicos: { selected: false },
      pot_otra_restriccion_pot: { selected: false },
      zona_declaratoria_especial: {
        aplica: false,
        otras_restricciones_seleccion: "No aplica",
      },
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
      expectedValue: 500000000,
      images: [mockFile],
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: false,
      documento_reglamento_ph: false,
      admin_fee: undefined,
      ph_aplica: true,
      ph_sometido_ley_675: false,
      ph_reglamento_interno: false,
      ph_reglamento_cubre_aspectos: false,
      ph_escritura_registrada: false,
      reglamentoPropiedadHorizontalInscrito: false,
      deudasCuotasAdministracion: false,
      ph_tipo_propiedad: undefined,
      ph_nombre_conjunto: undefined,
      ph_nit_copropiedad: undefined,
      ph_restriccion_arrendamiento: undefined,
      ph_cuotas_pendientes: undefined,
      ph_normativa_interna: undefined,
    };
    const { result } = renderHook(() => usePHFields(formData, mockSetFormData, mockSetErrors));

    act(() => {
      result.current.handlePHBooleanChange('ph_sometido_ley_675', true);
    });

    expect(mockSetFormData).toHaveBeenCalledWith('ph_sometido_ley_675', true, { shouldValidate: true });
  });

  it('should handle ph_tipo_propiedad change', () => {
    const formData: AppraisalFormData = {
      department: "Cundinamarca",
      city: "Bogotá",
      address: "Calle 123 #45-67",
      documento_ficha_predial_catastral: false,
      property_type: "Apartamento",
      estrato: "4",
      built_area: 100,
      pot_restriccion_uso_suelo: { selected: false },
      pot_restriccion_edificabilidad: { selected: false },
      pot_restriccion_altura: { selected: false },
      pot_afectacion_via_publica: { selected: false },
      pot_afectacion_ronda_hidrica: { selected: false },
      pot_afectacion_infraestructura_servicios_publicos: { selected: false },
      pot_otra_restriccion_pot: { selected: false },
      zona_declaratoria_especial: {
        aplica: false,
        otras_restricciones_seleccion: "No aplica",
      },
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
      expectedValue: 500000000,
      images: [mockFile],
      admin_fee: undefined,
      documento_certificado_tradicion_libertad: false,
      documento_escritura_publica: false,
      documento_recibo_impuesto_predial: false,
      documento_paz_salvo_administracion: false,
      documento_reglamento_ph: false,
      ph_aplica: true,
      ph_sometido_ley_675: false,
      ph_reglamento_interno: false,
      ph_reglamento_cubre_aspectos: false,
      ph_escritura_registrada: false,
      reglamentoPropiedadHorizontalInscrito: false,
      deudasCuotasAdministracion: false,
      ph_tipo_propiedad: undefined,
      ph_nombre_conjunto: undefined,
      ph_nit_copropiedad: undefined,
      ph_restriccion_arrendamiento: undefined,
      ph_cuotas_pendientes: undefined,
      ph_normativa_interna: undefined,
    };
    const { result } = renderHook(() => usePHFields(formData, mockSetFormData, mockSetErrors));

    act(() => {
      result.current.handlePHStringChange('ph_tipo_propiedad', 'Comercial');
    });

    expect(mockSetFormData).toHaveBeenCalledWith('ph_tipo_propiedad', 'Comercial', { shouldValidate: true });
  });
});
