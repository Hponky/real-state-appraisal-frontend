/// <reference types="jest" />
import { renderHook } from '@testing-library/react';
import { AppraisalFormDataSchema, AppraisalFormData } from '../hooks/appraisalFormSchema';
import { useAppraisalFormValidation } from '../hooks/useAppraisalFormValidation'; // Import the actual hook

// Mock the schema and other dependencies
jest.mock('../hooks/appraisalFormSchema', () => ({
  AppraisalFormDataSchema: {
    safeParse: jest.fn(),
  },
}));

describe('useAppraisalFormValidation', () => {
  const mockSetErrors = jest.fn();
  const mockClearImageErrors = jest.fn();

  // A base valid form data object matching the current schema
  const baseValidFormData: AppraisalFormData = {
    department: 'Cundinamarca',
    city: 'Bogota',
    address: 'Calle 123 #45-67',
    property_type: 'Apartamento',
    documento_ficha_predial_catastral: false,
    built_area: 100,
    estrato: '3',
    pot_restriccion_uso_suelo: { selected: false },
    pot_restriccion_edificabilidad: { selected: false },
    pot_restriccion_altura: { selected: false },
    pot_afectacion_via_publica: { selected: false },
    pot_afectacion_ronda_hidrica: { selected: false },
    pot_afectacion_infraestructura_servicios_publicos: { selected: false },
    pot_otra_restriccion_pot: { selected: false },
    pot_otras_restricciones_descripcion: undefined,
    zona_declaratoria_especial: {
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      restricciones_comunes_descripcion: undefined,
      otras_restricciones_seleccion: 'No aplica',
      otras_restricciones_descripcion: undefined,
      fuente: undefined,
      declaratoriaImponeObligaciones: false,
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
    impuestoPredialAlDia: false,
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
      declaracion_veracidad: true,
      entendimiento_alcance_analisis: true,
      declaracion_propiedad_exclusiva: true,
      declaracion_uso_previsto: true,
      declaracion_cumplimiento_normas: true,
      declaracion_sin_litigios: true,
      declaracion_servidumbres: true,
      declaracion_sin_afectaciones: true,
      declaracion_impuestos_pagados: true,
      declaracion_sin_deudas_asociacion: true,
      declaracion_informacion_completa: true,
      informacionVerazCompleta: true,
      entendimientoAnalisisLegal: true,
      autorizacionTratamientoDatos: true,
    },
    expectedValue: 1500000,
    images: [new File([], 'image1.jpg')],
    admin_fee: 0,
    ph_aplica: false,
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    ph_tipo_propiedad: 'Residencial', // Set to a valid enum value to avoid TS error
    ph_nombre_conjunto: undefined,
    ph_nit_copropiedad: undefined,
    ph_restriccion_arrendamiento: undefined,
    ph_cuotas_pendientes: undefined,
    ph_normativa_interna: undefined,
    reglamentoPropiedadHorizontalInscrito: false,
    deudasCuotasAdministracion: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true and no errors for valid data', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });

    const { result } = renderHook(() => useAppraisalFormValidation(
      baseValidFormData, // formData
      [new File([''], 'valid.jpg')], // imageFiles - provide a valid image
      null, // imageErrors
      true, // showLegalSections
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(true);
    expect(mockSetErrors).toHaveBeenCalledWith({});
  });

  it('should return false and set errors for invalid Zod data', () => {
    const zodErrors = {
      success: false,
      error: {
        errors: [
          { path: ['department'], message: 'El departamento es requerido.' },
          { path: ['estrato'], message: 'Required' }, // Zod's default error for required string
        ],
        flatten: () => ({
          fieldErrors: {
            department: ['El departamento es requerido.'],
            estrato: ['Required'],
          },
          formErrors: [],
        }),
      },
    };
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue(zodErrors);

   const { result } = renderHook(() => useAppraisalFormValidation(
     {
        ...baseValidFormData,
        department: "", // Missing department
        estrato: '', // Missing estrato - Changed from undefined to empty string to satisfy TS
     },
     [new File([''], 'valid.jpg')], // imageFiles - provide a valid image
     null,
     true,
     mockSetErrors,
     mockClearImageErrors
   ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      department: 'El departamento es requerido.',
      estrato: 'Required',
    }));
  });

  it('should return false and set image error if no images are uploaded', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });

    const { result } = renderHook(() => useAppraisalFormValidation(
      { ...baseValidFormData, images: [] }, // No image files in formData
      [], // No image files in imageFiles parameter
      null,
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      images: 'Cargue al menos una imagen',
    }));
  });

  it('should return false and set image error if too many images are uploaded', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });
    const largeImageArray = Array(31).fill(new File([''], 'image.jpg'));

    const { result } = renderHook(() => useAppraisalFormValidation(
      { ...baseValidFormData, images: largeImageArray }, // 31 image files in formData
      largeImageArray, // 31 image files in imageFiles parameter
      null,
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      images: 'Puede cargar un máximo de 30 imágenes',
    }));
  });

  it('should include image errors from image handler hook', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });

    const { result } = renderHook(() => useAppraisalFormValidation(
      baseValidFormData,
      [new File([''], 'image.jpg')],
      'Image handler error', // imageErrors from hook
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      images: 'Image handler error',
    }));
  });

  it('should validate conditional fields in Section B if ph_aplica is true', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        ...baseValidFormData,
        ph_aplica: true,
        ph_tipo_propiedad: undefined as AppraisalFormData['ph_tipo_propiedad'], // Missing
        ph_nombre_conjunto: '', // Missing
        ph_nit_copropiedad: '', // Missing
        ph_restriccion_arrendamiento: '', // Missing
        ph_cuotas_pendientes: '', // Missing
        ph_normativa_interna: '', // Missing
      } as AppraisalFormData, // Explicitly cast to AppraisalFormData
      [new File([''], 'image.jpg')],
      null,
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      ph_tipo_propiedad: 'Seleccione el tipo de propiedad en Propiedad Horizontal.',
      ph_nombre_conjunto: 'Ingrese el nombre del conjunto/edificio.',
      ph_nit_copropiedad: 'Ingrese el NIT de la copropiedad.',
      ph_restriccion_arrendamiento: 'Especifique las restricciones de arrendamiento.',
      ph_cuotas_pendientes: 'Especifique las cuotas de administración pendientes.',
      ph_normativa_interna: 'Especifique la normativa interna relevante.',
    }));
  });

  it('should not validate conditional fields in Section B if ph_aplica is false', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: baseValidFormData });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        ...baseValidFormData,
        ph_aplica: false, // ph_aplica is false
        ph_tipo_propiedad: undefined, // These should not trigger errors
        ph_nombre_conjunto: '',
        ph_nit_copropiedad: '',
        ph_restriccion_arrendamiento: '',
        ph_cuotas_pendientes: '',
        ph_normativa_interna: '',
      },
      [new File([''], 'image.jpg')],
      null,
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(true); // Should be true because conditional validation is skipped
    expect(mockSetErrors).toHaveBeenCalledWith({});
  });
});
