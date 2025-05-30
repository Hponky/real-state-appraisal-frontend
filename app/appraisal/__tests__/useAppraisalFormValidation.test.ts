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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true and no errors for valid data', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: ["image.jpg"],
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData, // formData
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
          { path: ['department'], message: 'Department is required' },
          { path: ['area'], message: 'Area must be a number' },
        ],
      },
    };
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue(zodErrors);

   const { result } = renderHook(() => useAppraisalFormValidation(
     {
        department: "", // Missing department
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: ["image.jpg"],
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
     } as AppraisalFormData, // formData - department and area are missing/invalid
     [new File([''], 'valid.jpg')], // imageFiles - provide a valid image
     null,
     true,
     mockSetErrors,
     mockClearImageErrors
   ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      department: 'Department is required',
      area: 'Area must be a number', // Zod's default error for 'number' type when 'area' is missing
    }));
  });

  it('should return false and set image error if no images are uploaded', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: [], // No image files
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData,
      [], // No image files
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
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });
    const largeImageArray = Array(31).fill(new File([''], 'image.jpg'));

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: largeImageArray, // 31 image files
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData,
      largeImageArray, // 31 image files
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
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: ["image.jpg"],
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData,
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
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: ["image.jpg"],
        ph_aplica: true,
        ph_sometido_ley_675: false, // Explicitly set to false
        ph_reglamento_interno: false, // Explicitly set to false
        ph_reglamento_cubre_aspectos: false, // Explicitly set to false
        ph_escritura_registrada: false, // Explicitly set to false
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: '',
        ph_nit_copropiedad: '',
        ph_restriccion_arrendamiento: '',
        ph_cuotas_pendientes: '',
        ph_normativa_interna: '',
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData,
      [new File([''], 'image.jpg')],
      null,
      true,
      mockSetErrors,
      mockClearImageErrors
    ));

    const isValid = result.current.validateForm();
    expect(isValid).toBe(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.objectContaining({
      ph_sometido_ley_675: 'Debe confirmar si el inmueble está sometido a la Ley 675 de 2001.',
      ph_reglamento_interno: 'Debe confirmar si existe un reglamento interno.',
      ph_reglamento_cubre_aspectos: 'Debe confirmar si el reglamento cubre aspectos relevantes.',
      ph_escritura_registrada: 'Debe confirmar si la escritura está registrada.',
      ph_tipo_propiedad: 'El tipo de propiedad es requerido si aplica PH.',
      ph_nombre_conjunto: 'El nombre del conjunto/edificio es requerido si aplica PH.',
      ph_nit_copropiedad: 'El NIT de la copropiedad es requerido si aplica PH.',
    }));
  });

  it('should not validate conditional fields in Section B if ph_aplica is false', () => {
    (AppraisalFormDataSchema.safeParse as jest.Mock).mockReturnValue({ success: true, data: {} });

    const { result } = renderHook(() => useAppraisalFormValidation(
      {
        department: "Some Department",
        city: "Some City",
        neighborhood: "Some Neighborhood",
        address: "Some Address",
        cadastral_certificate: "Some Cadastral Certificate",
        property_type: "Casa",
        built_area: 100,
        private_area: 90,
        number_of_floors: 2,
        estrato: 3,
        construction_year: 2000,
        structural_type: "Concreto",
        facade_type: "Ladrillo",
        material_quality: [{ material: "Piso", quality: "Alta", description: "Cerámica" }],
        conservation_status: "Bueno",
        urban_planning: "Urbano",
        access_roads: "Pavimentadas",
        public_services: ["Agua"],
        legal_documents: ["Escritura"],
        expectedValue: 100000,
        images: ["image.jpg"],
        ph_aplica: false,
        ph_sometido_ley_675: false,
        ph_reglamento_interno: false,
        ph_reglamento_cubre_aspectos: false,
        ph_escritura_registrada: false,
        ph_tipo_propiedad: undefined,
        ph_nombre_conjunto: undefined,
        ph_nit_copropiedad: undefined,
        ph_restriccion_arrendamiento: undefined,
        ph_cuotas_pendientes: undefined,
        ph_normativa_interna: undefined,
        pot_restrictions: undefined,
        zona_declaratoria_especial: {
          aplica: false,
          tipo: undefined,
          restricciones_comunes_descripcion: undefined,
          otras_restricciones: undefined,
          fuente: undefined,
        },
        legal_declarations: {
          declaracion_propiedad_exclusiva: true,
          declaracion_uso_previsto: true,
          declaracion_cumplimiento_normas: true,
          declaracion_sin_litigios: true,
          declaracion_servidumbres: true,
          declaracion_sin_afectaciones: true,
          declaracion_impuestos_pagados: true,
          declaracion_sin_deudas_asociacion: true,
          declaracion_informacion_completa: true,
        },
      } as AppraisalFormData,
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
