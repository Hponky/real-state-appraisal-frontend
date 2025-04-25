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

  test('should validate a valid form data object', () => {
    const result = appraisalFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  test('should validate form data with optional fields missing or null', () => {
    const formDataWithOptionalMissing: AppraisalFormData = {
      ...validFormData,
      area: undefined,
      adminFee: undefined,
      materialQualityEntries: undefined,
    };
    const resultMissing = appraisalFormSchema.safeParse(formDataWithOptionalMissing);
    expect(resultMissing.success).toBe(true);

    const formDataWithOptionalNull: AppraisalFormData = {
      ...validFormData,
      area: null,
      adminFee: null,
      materialQualityEntries: [],
    };
    const resultNull = appraisalFormSchema.safeParse(formDataWithOptionalNull);
    expect(resultNull.success).toBe(true);
  });

  test('should fail validation if required fields are empty', () => {
    const invalidFormData = {
      ...validFormData,
      department: '',
      city: '',
      address: '',
      stratum: '',
      expectedValue: null, // Expected value is required and positive
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
      expect(errors.expectedValue).toEqual(['Ingrese el valor esperado']); // Check for required error first
      expect(errors.propertyType).toEqual(['Seleccione el tipo de inmueble']);
    }
  });

  test('should fail validation for invalid numeric fields', () => {
    const invalidFormData = {
      ...validFormData,
      area: -10, // Area must be positive
      adminFee: -100, // Admin fee must be non-negative
      expectedValue: -50000, // Expected value must be positive
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
      // Preprocess converts non-numeric strings to NaN, which then fails the number check
      expect(errors.area).toEqual(['Ingrese un área numérica positiva']);
      expect(errors.adminFee).toEqual(['Ingrese una administración numérica no negativa']);
      expect(errors.expectedValue).toEqual(['Ingrese un valor numérico para el valor esperado']);
    }
  });


  test('should fail validation for invalid material quality entries', () => {
    const invalidEntriesFormData = {
      ...validFormData,
      materialQualityEntries: [
        { id: '1', location: '', qualityDescription: 'Good' }, // Missing location
        { id: '2', location: 'Bathroom', qualityDescription: '' }, // Missing description
        { id: '3', location: 'Bedroom', qualityDescription: 'Nice' }, // Valid
      ],
    };

    const result = appraisalFormSchema.safeParse(invalidEntriesFormData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      // Use type assertion to handle dynamic keys for array errors
      const materialErrors: any = errors;

      expect(materialErrors['materialQualityEntries.0.location']).toEqual(['Ingrese la ubicación']);
      expect(materialErrors['materialQualityEntries.1.qualityDescription']).toEqual(['Ingrese la descripción de calidad']);
      expect(materialErrors['materialQualityEntries.2.location']).toBeUndefined(); // Valid entry should not have errors
      expect(materialErrors['materialQualityEntries.2.qualityDescription']).toBeUndefined(); // Valid entry should not have errors
    }
  });
});