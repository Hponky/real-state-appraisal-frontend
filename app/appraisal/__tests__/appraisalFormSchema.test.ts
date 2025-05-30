import { AppraisalFormDataSchema, AppraisalFormData } from '../hooks/appraisalFormSchema';

describe('AppraisalFormDataSchema', () => {
  const validFormData: AppraisalFormData = {
    department: 'Cundinamarca',
    city: 'Bogota',
    neighborhood: 'La Candelaria',
    address: 'Calle 123 #45-67',
    cadastral_certificate: '123456789',
    property_type: 'Apartamento',
    built_area: 100,
    private_area: 90,
    number_of_floors: 5,
    estrato: 3,
    pot_restrictions: [],
    pot_otras_restricciones_descripcion: '',
    zona_declaratoria_especial: {
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      restricciones_comunes_descripcion: undefined,
      otras_restricciones_seleccion: 'No aplica',
      otras_restricciones_descripcion: undefined,
      fuente: undefined,
    },
    construction_year: 2000,
    structural_type: 'Concreto',
    facade_type: 'Ladrillo',
    material_quality: [
      { material: 'Pisos', quality: 'Alta', description: 'Mármol' },
    ],
    conservation_status: 'Bueno',
    urban_planning: 'Urbano',
    access_roads: 'Buenas',
    public_services: ['Agua', 'Luz'],
    legal_documents: ['Escritura'],
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
    expectedValue: 1500000,
    images: ['image1.jpg'],
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
  };

  test('should validate a valid form data object', () => {
    const result = AppraisalFormDataSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  test('should validate form data with optional fields missing or null', () => {
    const formDataWithOptionalMissing: AppraisalFormData = {
      ...validFormData,
      built_area: undefined,
      private_area: undefined,
      number_of_floors: undefined,
      estrato: undefined,
      pot_restrictions: undefined,
      pot_otras_restricciones_descripcion: undefined,
      material_quality: undefined,
      public_services: undefined,
      legal_documents: undefined,
      images: undefined,
    };
    const resultMissing = AppraisalFormDataSchema.safeParse(formDataWithOptionalMissing);
    expect(resultMissing.success).toBe(true);

    const formDataWithOptionalNull: AppraisalFormData = {
      ...validFormData,
      built_area: null,
      private_area: null,
      number_of_floors: null,
      estrato: null,
      pot_restrictions: [],
      pot_otras_restricciones_descripcion: null,
      material_quality: [],
      public_services: [],
      legal_documents: [],
      images: [],
    };
    const resultNull = AppraisalFormDataSchema.safeParse(formDataWithOptionalNull);
    expect(resultNull.success).toBe(true);
  });

  test('should fail validation if required fields are empty', () => {
    const invalidFormData = {
      ...validFormData,
      department: '',
      city: '',
      neighborhood: '',
      address: '',
      cadastral_certificate: '',
      property_type: '',
      built_area: null,
      private_area: null,
      number_of_floors: null,
      estrato: null,
      construction_year: null,
      structural_type: '',
      facade_type: '',
      material_quality: [],
      conservation_status: '',
      urban_planning: '',
      access_roads: '',
      public_services: [],
      legal_documents: [],
      expectedValue: null,
      images: [],
    };

    const result = AppraisalFormDataSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.department).toEqual(['El departamento es requerido.']);
      expect(errors.city).toEqual(['La ciudad es requerida.']);
      expect(errors.neighborhood).toEqual(['El barrio es requerido.']);
      expect(errors.address).toEqual(['La dirección es requerida.']);
      expect(errors.cadastral_certificate).toEqual(['El certificado catastral es requerido.']);
      expect(errors.property_type).toEqual(['El tipo de propiedad es requerido.']);
      expect(errors.built_area).toEqual(['El área construida debe ser un número positivo.']);
      expect(errors.private_area).toEqual(['El área privada debe ser un número positivo.']);
      expect(errors.number_of_floors).toEqual(['El número de pisos debe ser un número positivo.']);
      expect(errors.estrato).toEqual(['El estrato es requerido y debe ser un número positivo.']);
      expect(errors.construction_year).toEqual(['El año de construcción debe ser un año válido.']);
      expect(errors.structural_type).toEqual(['El tipo estructural es requerido.']);
      expect(errors.facade_type).toEqual(['El tipo de fachada es requerido.']);
      expect(errors.material_quality).toEqual(['Debe añadir al menos una entrada de calidad de materiales.']);
      expect(errors.conservation_status).toEqual(['El estado de conservación es requerido.']);
      expect(errors.urban_planning).toEqual(['El plan urbanístico es requerido.']);
      expect(errors.access_roads).toEqual(['Las vías de acceso son requeridas.']);
      expect(errors.public_services).toEqual(['Debe seleccionar al menos un servicio público.']);
      expect(errors.legal_documents).toEqual(['Debe adjuntar al menos un documento legal.']);
      expect(errors.expectedValue).toEqual(['El valor esperado debe ser un número positivo.']);
      expect(errors.images).toEqual(['Debe subir al menos una imagen del inmueble.']);
    }
  });

  test('should fail validation for invalid numeric fields', () => {
    const invalidFormData = {
      ...validFormData,
      built_area: -10,
      private_area: -5,
      number_of_floors: 0,
      estrato: 0,
      construction_year: 1700,
      expectedValue: -50000,
    };

    const result = AppraisalFormDataSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.built_area).toEqual(['El área construida debe ser un número positivo.']);
      expect(errors.private_area).toEqual(['El área privada debe ser un número positivo.']);
      expect(errors.number_of_floors).toEqual(['El número de pisos debe ser un número positivo.']);
      expect(errors.estrato).toEqual(['El estrato es requerido y debe ser un número positivo.']);
      expect(errors.construction_year).toEqual(['El año de construcción debe ser un año válido.']);
      expect(errors.expectedValue).toEqual(['El valor esperado debe ser un número positivo.']);
    }
  });

  test('should handle string input for numeric fields using preprocess', () => {
    const formDataWithStringNumerics = {
      ...validFormData,
      built_area: '150',
      private_area: '130',
      number_of_floors: '10',
      estrato: '4',
      construction_year: '2010',
      expectedValue: '2000000',
    };

    const result = AppraisalFormDataSchema.safeParse(formDataWithStringNumerics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.built_area).toBe(150);
      expect(result.data.private_area).toBe(130);
      expect(result.data.number_of_floors).toBe(10);
      expect(result.data.estrato).toBe(4);
      expect(result.data.construction_year).toBe(2010);
      expect(result.data.expectedValue).toBe(2000000);
    }
  });

  test('should handle empty string input for optional numeric fields using preprocess', () => {
    const formDataWithEmptyStringNumerics = {
      ...validFormData,
      built_area: '',
      private_area: '',
      number_of_floors: '',
      estrato: '',
    };

    const result = AppraisalFormDataSchema.safeParse(formDataWithEmptyStringNumerics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.built_area).toBeNull();
      expect(result.data.private_area).toBeNull();
      expect(result.data.number_of_floors).toBeNull();
      expect(result.data.estrato).toBeNull();
    }
  });

  test('should fail validation for non-numeric string input in numeric fields', () => {
    const invalidFormData = {
      ...validFormData,
      built_area: 'abc',
      private_area: 'def',
      number_of_floors: 'ghi',
      estrato: 'jkl',
      construction_year: 'mno',
      expectedValue: 'pqr',
    };

    const result = AppraisalFormDataSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.built_area).toEqual(['El área construida debe ser un número positivo.']);
      expect(errors.private_area).toEqual(['El área privada debe ser un número positivo.']);
      expect(errors.number_of_floors).toEqual(['El número de pisos debe ser un número positivo.']);
      expect(errors.estrato).toEqual(['El estrato es requerido y debe ser un número positivo.']);
      expect(errors.construction_year).toEqual(['El año de construcción debe ser un año válido.']);
      expect(errors.expectedValue).toEqual(['El valor esperado debe ser un número positivo.']);
    }
  });

  test('should fail validation for invalid material quality entries', () => {
    const invalidEntriesFormData = {
      ...validFormData,
      material_quality: [
        { material: '', quality: 'Alta', description: 'Mármol' }, // Missing material
        { material: 'Paredes', quality: '', description: 'Pintura' }, // Missing quality
      ],
    };

    const result = AppraisalFormDataSchema.safeParse(invalidEntriesFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const materialErrors: any = errors;

      expect(materialErrors['material_quality.0.material']).toEqual(['El material es requerido.']);
      expect(materialErrors['material_quality.1.quality']).toEqual(['La calidad es requerida.']);
    }
  });

  describe('ZonaDeclaratoriaEspecialSchema', () => {
    const baseDeclaratoriaEspecial = {
      aplica: true,
      tipo: 'Cultural',
      fuente: 'Decreto 123',
      restricciones_comunes: [],
      restricciones_comunes_descripcion: undefined,
      otras_restricciones_seleccion: 'No aplica',
      otras_restricciones_descripcion: undefined,
    };

    test('should validate a valid ZonaDeclaratoriaEspecialSchema when aplica is true', () => {
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: baseDeclaratoriaEspecial,
      });
      expect(result.success).toBe(true);
    });

    test('should fail validation if aplica is true and tipo is missing', () => {
      const invalidData = {
        ...baseDeclaratoriaEspecial,
        tipo: undefined,
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: invalidData,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors['zona_declaratoria_especial.tipo']).toEqual(['El tipo de declaratoria especial es requerido.']);
      }
    });

    test('should fail validation if "Otra" is selected in restricciones_comunes but descripcion is missing', () => {
      const invalidData = {
        ...baseDeclaratoriaEspecial,
        restricciones_comunes: ['Otra'],
        restricciones_comunes_descripcion: '',
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: invalidData,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors['zona_declaratoria_especial.restricciones_comunes_descripcion']).toEqual(["La descripción de otras restricciones comunes es requerida si se selecciona 'Otra'."]);
      }
    });

    test('should pass validation if "Otra" is selected and descripcion is provided', () => {
      const validData = {
        ...baseDeclaratoriaEspecial,
        restricciones_comunes: ['Otra'],
        restricciones_comunes_descripcion: 'Restricción común específica',
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: validData,
      });
      expect(result.success).toBe(true);
    });

    test('should fail validation if "Sí, especificar" is selected in otras_restricciones_seleccion but descripcion is missing', () => {
      const invalidData = {
        ...baseDeclaratoriaEspecial,
        otras_restricciones_seleccion: 'Sí, especificar',
        otras_restricciones_descripcion: '',
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: invalidData,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors['zona_declaratoria_especial.otras_restricciones_descripcion']).toEqual(["La descripción de otras restricciones es requerida si se selecciona 'Sí, especificar'."]);
      }
    });

    test('should pass validation if "Sí, especificar" is selected and descripcion is provided', () => {
      const validData = {
        ...baseDeclaratoriaEspecial,
        otras_restricciones_seleccion: 'Sí, especificar',
        otras_restricciones_descripcion: 'Otra restricción específica',
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: validData,
      });
      expect(result.success).toBe(true);
    });

    test('should fail validation if aplica is true and fuente is missing', () => {
      const invalidData = {
        ...baseDeclaratoriaEspecial,
        fuente: undefined,
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: invalidData,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors['zona_declaratoria_especial.fuente']).toEqual(['La fuente de la declaratoria es requerida.']);
      }
    });

    test('should validate successfully when aplica is false, regardless of other fields', () => {
      const dataWhenNotApplicable = {
        aplica: false,
        tipo: undefined,
        fuente: undefined,
        restricciones_comunes: [],
        restricciones_comunes_descripcion: undefined,
        otras_restricciones_seleccion: 'No aplica',
        otras_restricciones_descripcion: undefined,
      };
      const result = appraisalFormSchema.safeParse({
        ...validFormData,
        zona_declaratoria_especial: dataWhenNotApplicable,
      });
      expect(result.success).toBe(true);
    });
  });
});