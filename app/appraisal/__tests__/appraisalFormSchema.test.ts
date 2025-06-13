import { appraisalFormSchema, AppraisalFormData } from '../appraisalFormSchema';

describe('appraisalFormSchema', () => {
  const validFormData: AppraisalFormData = {
    department: 'Cundinamarca',
    city: 'Bogota',
    address: 'Calle 123 #45-67',
    area: 100,
    stratum: '3',
    adminFee: 50000,
    expectedValue: 1500000,
    propertyType: 'Apartamento',
    materialQualityEntries: [
      { id: '1', location: 'Kitchen', qualityDescription: 'Good' },
      { id: '2', location: 'Bathroom', qualityDescription: 'Average' },
    ],
  };
/**
 * Valida que un formulario completamente diligenciado sea aceptado por el esquema de validación.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
  test('should validate a valid form data object', () => {
    const result = appraisalFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });
/**
 * Valida que el esquema rechace cuando los campos opcionales están ausentes o nulos.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-02 - Validar mensaje de error cuando falta un campo obligatorio
 */
  test('should validate form data with optional fields missing or null', () => {
    const formDataWithOptionalMissing: AppraisalFormData = {
      ...validFormData,
      area: undefined,
      adminFee: undefined,
      materialQualityEntries: undefined,
    };
    const resultMissing = appraisalFormSchema.safeParse(formDataWithOptionalMissing);
    console.log('Missing validation result:', resultMissing);
    expect(resultMissing.success).toBe(false); 

    const formDataWithOptionalNull: AppraisalFormData = {
      ...validFormData,
      area: null,
      adminFee: null,
      materialQualityEntries: [],
    };
    const resultNull = appraisalFormSchema.safeParse(formDataWithOptionalNull);
    console.log('Null validation result:', resultNull);
    expect(resultNull.success).toBe(false); 
  });
/**
 * Verifica que el esquema muestre errores cuando los campos requeridos están vacíos o nulos.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-02 - Validar mensaje de error cuando falta un campo obligatorio
 */
  test('should fail validation if required fields are empty', () => {
    const invalidFormData = {
      ...validFormData,
      department: '',
      city: '',
      address: '',
      stratum: '',
      expectedValue: null, 
      propertyType: '',
    };

    const result = appraisalFormSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.department).toEqual(['Seleccione un departamento']);
      expect(errors.city).toEqual(['Seleccione una ciudad']);
      expect(errors.address).toEqual(['Ingrese una dirección válida']);
      expect(errors.stratum).toEqual(['Seleccione un estrato']);
      expect(errors.expectedValue).toBeDefined();      
      expect(errors.propertyType).toEqual(['Seleccione el tipo de inmueble']);
    }
  });
/**
 * Verifica que el esquema rechace números negativos en campos numéricos.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-03 - Validar ingreso de valores no permitidos en los campos
 */
  test('should fail validation for invalid numeric fields', () => {
    const invalidFormData = {
      ...validFormData,
      area: -10, 
      adminFee: -100, 
      expectedValue: -50000, 
    };

    const result = appraisalFormSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.area).toEqual(['Ingrese un área numérica positiva']);
      expect(errors.adminFee).toEqual(['Ingrese una administración numérica no negativa']);
      expect(errors.expectedValue).toEqual(['Ingrese un valor numérico positivo para el valor esperado']);
    }
  });
/**
 * Verifica que el esquema acepte strings numéricos válidos y los convierta correctamente.
 *
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
  test('should handle string input for numeric fields using preprocess', () => {
    const formDataWithStringNumerics = {
      ...validFormData,
      area: '150',
      adminFee: '75000',
      expectedValue: '2000000',
    };

    const result = appraisalFormSchema.safeParse(formDataWithStringNumerics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.area).toBe(150);
      expect(result.data.adminFee).toBe(75000);
      expect(result.data.expectedValue).toBe(2000000);
    }
  });
/**
 * Verifica que strings vacíos en campos numéricos opcionales sean tratados como null.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-07 - Validar funcionamiento del campo "¿Paga administración?"
 */
  test('should handle empty string input for optional numeric fields using preprocess', () => {
    const formDataWithEmptyStringNumerics = {
      ...validFormData,
      area: '',
      adminFee: '',
    };

    const result = appraisalFormSchema.safeParse(formDataWithEmptyStringNumerics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.area).toBeNull();
      expect(result.data.adminFee).toBeNull();
    }
  });
/**
 * Verifica que el esquema rechace strings no numéricos en campos numéricos.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-03 - Validar ingreso de valores no permitidos en los campos
 */
  test('should fail validation for non-numeric string input in numeric fields', () => {
    const invalidFormData = {
      ...validFormData,
      area: 'abc',
      adminFee: 'xyz',
      expectedValue: 'def',
    };

    const result = appraisalFormSchema.safeParse(invalidFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.log(JSON.stringify(errors, null, 2));
      expect(errors.area).toBeDefined();
      expect(errors.area.length).toBeGreaterThan(0);   
      expect(errors.adminFee).toBeDefined();
      expect(errors.adminFee.length).toBeGreaterThan(0);
      expect(errors.expectedValue).toBeDefined();
      expect(errors.expectedValue.length).toBeGreaterThan(0);
    }
  });
/**
 * Verifica que el esquema detecte entradas inválidas en la lista de calidad de materiales.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should fail validation for invalid material quality entries', () => {
    const invalidEntriesFormData = {
      ...validFormData,
      materialQualityEntries: [
        { id: '1', location: '', qualityDescription: 'Good' }, 
        { id: '2', location: 'Bathroom', qualityDescription: '' }, 
        { id: '3', location: 'Bedroom', qualityDescription: 'Nice' }, 
      ],
    };

    const result = appraisalFormSchema.safeParse(invalidEntriesFormData);
    expect(result.success).toBe(false);
    if (!result.success) {
      console.log('Zod Error Structure:', JSON.stringify(result.error, null, 2));
      const errors = result.error.flatten().fieldErrors;
      console.log('Flattened Errors:', JSON.stringify(errors, null, 2));
      if (errors.materialQualityEntries) {
        expect(errors.materialQualityEntries).toBeDefined();
      } else {
        const materialErrors: any = errors;
        expect(materialErrors['materialQualityEntries.0.location'] || 
               materialErrors['materialQualityEntries[0].location']).toBeDefined();     
        expect(materialErrors['materialQualityEntries.1.qualityDescription'] || 
               materialErrors['materialQualityEntries[1].qualityDescription']).toBeDefined();
        expect(materialErrors['materialQualityEntries.2.location'] || 
               materialErrors['materialQualityEntries[2].location']).toBeUndefined();
        expect(materialErrors['materialQualityEntries.2.qualityDescription'] || 
               materialErrors['materialQualityEntries[2].qualityDescription']).toBeUndefined();
      }
    }
  });  
});