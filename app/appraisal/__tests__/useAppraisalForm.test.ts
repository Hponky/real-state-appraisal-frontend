import { renderHook, act, waitFor } from '@testing-library/react'; // Import from @testing-library/react
import { useAppraisalForm } from '../hooks/useAppraisalForm';
import { AppraisalFormData, appraisalFormSchema } from '../hooks/appraisalFormSchema'; // Import the schema and type
import { placesApiService, Department } from '../../services/placesApi'; // Import Department type
import { useImageHandler } from '../hooks/useImageHandler';
import { useMaterialQualityEntries } from '../hooks/useMaterialQualityEntries';
import { useAppraisalSubmission } from '../hooks/useAppraisalSubmission';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('../../services/placesApi');
jest.mock('../useImageHandler');
jest.mock('../useMaterialQualityEntries');
jest.mock('../useAppraisalSubmission');

const mockUseImageHandler = useImageHandler as jest.Mock;
const mockUseMaterialQualityEntries = useMaterialQualityEntries as jest.Mock;
const mockUseAppraisalSubmission = useAppraisalSubmission as jest.Mock;
const mockPlacesApiService = placesApiService as jest.Mocked<typeof placesApiService>;

describe('useAppraisalForm', () => {
  const initialFormData: AppraisalFormData = {
    department: "",
    city: "",
    address: "",
    area: null,
    stratum: "",
    adminFee: null,
    expectedValue: 0,
    propertyType: "",
    materialQualityEntries: [],
    // Default values for new optional legal section B fields
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    ph_tipo_propiedad: undefined,
    ph_nombre_conjunto: "", // Keep existing fields
    ph_nit_copropiedad: "",
    ph_restriccion_arrendamiento: "",
    ph_cuotas_pendientes: "",
    ph_normativa_interna: "",
    // Keep other optional legal sections fields
    uso_principal: undefined, pot_restriccion_uso: { selectedRestrictions: [], otherRestrictions: "" },
    zona_declaratoria_especial: { // Initialize as an object
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      otras_restricciones: "",
      fuente: "",
    },
    licencia_urbanistica: "", contrato_escrito_vigente: "", preferencia_requisito_futuro_contrato: "",
    responsable_servicios_publicos: "", gravamenes_cargas: "", impuesto_predial_dia: "",
    litigios_proceso_judicial: "", acceso_servicios_publicos: "", condiciones_seguridad_salubridad: "",
    seguros_obligatorios_recomendables: "", documento_certificado_tradicion_libertad: false,
    documento_escritura_publica: false, documento_recibo_impuesto_predial: false,
    documento_paz_salvo_administracion: "", documento_reglamento_ph: "", documentos_otros: "",
    declaracion_veracidad: false, entendimiento_alcance_analisis: false,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations for child hooks
    mockUseImageHandler.mockReturnValue({
      images: [],
      imageFiles: [],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });

    mockUseMaterialQualityEntries.mockReturnValue({
      materialQualityEntries: [],
      addMaterialQualityEntry: jest.fn(),
      removeMaterialQualityEntry: jest.fn(),
      updateMaterialQualityEntry: jest.fn(),
    });

    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: jest.fn(), // Simplified mock: just a function that can be resolved/rejected
    });

    // Default mock for placesApiService
    mockPlacesApiService.getPlaces.mockResolvedValue([
      { id: 1, departamento: 'Dept1', ciudades: ['CityA', 'CityB'] }, // Add id
      { id: 2, departamento: 'Dept2', ciudades: ['CityC'] }, // Add id
    ] as Department[]); // Cast to Department[]
  });

  test('should initialize with default form data', () => {
    const { result } = renderHook(() => useAppraisalForm());
    expect(result.current.formData).toEqual(initialFormData);
  });

  test('initialFormData should be invalid according to schema', () => {
    const result = appraisalFormSchema.safeParse(initialFormData);
    console.log("Validation result for initialFormData:", result); // Log the result
    expect(result.success).toBe(false);
  });

  test('should update form data using setFormData', () => {
    const { result } = renderHook(() => useAppraisalForm());
    const newAddress = 'New Address 123';
    act(() => {
      result.current.setFormData((prev: AppraisalFormData) => ({ ...prev, address: newAddress })); // Explicitly type prev
    });
    expect(result.current.formData.address).toBe(newAddress);
  });

  test('should handle numeric change for area, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('area', '100');
    });
    expect(result.current.formData.area).toBe(100);

    act(() => {
      result.current.handleNumericChange('area', '');
    });
    expect(result.current.formData.area).toBeNull();
  });

  test('should handle numeric change for adminFee, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('adminFee', '50000');
    });
    expect(result.current.formData.adminFee).toBe(50000);

    act(() => {
      result.current.handleNumericChange('adminFee', '');
    });
    expect(result.current.formData.adminFee).toBeNull();
  });

  test('should handle numeric change for expectedValue, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('expectedValue', '1500000');
    });
    expect(result.current.formData.expectedValue).toBe(1500000);

    // Although schema expects positive, hook helper allows empty string which becomes null
    // Zod validation will handle the final check
    act(() => {
      result.current.handleNumericChange('expectedValue', '');
    });
    expect(result.current.formData.expectedValue).toBeNull();
  });

  test('should call clearImageErrors before validation in handleSubmit', async () => {
    const mockClearImageErrors = jest.fn();
    const mockSubmitFormData = jest.fn();

    mockUseImageHandler.mockReturnValue({
      images: ['dummy.jpg'], // Provide dummy data to pass validation
      imageFiles: [new File(['dummy'], 'dummy.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: mockClearImageErrors,
    });

    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: mockSubmitFormData,
    });

    // Render the hook with the mocked dependencies
    const { result } = renderHook(() => useAppraisalForm());

    // Set form data to be valid for submission
    act(() => {
        result.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });


    await act(async () => {
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });

    // Verify that clearImageErrors was called and submitFormData was called
    // We cannot directly check if clearImageErrors was called *before* validation
    // without spying on the internal validateForm function, which is not exposed.
    // We rely on the hook's implementation detail that it clears errors before validating.
    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSubmitFormData).toHaveBeenCalled();
  });

  test('should call validateForm and submitFormData on handleSubmit if form is valid', async () => {
    const mockSubmitFormData = jest.fn();

    // Mock child hook return values for this test to simulate a valid state
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'], // Simulate having an image for validation
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });

    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: mockSubmitFormData,
    });

    // Render the hook with the mocked dependencies
    const { result } = renderHook(() => useAppraisalForm());

    // Set form data to be valid for submission
    act(() => {
        result.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });

    await act(async () => {
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });

    // Verify that submitFormData was called
    // We cannot directly verify that validateForm was called without spying on it,
    // but if submitFormData is called, it implies validation passed.
    expect(mockSubmitFormData).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false); // Should be false after submission
    expect(result.current.errors.submit).toBeUndefined(); // No submit error on success
  });

  test('should call validateForm but not submitFormData on handleSubmit if form is invalid', async () => {
    const mockSubmitFormData = jest.fn();
    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: mockSubmitFormData,
    });

    // Render the hook with the mocked dependencies
    const { result } = renderHook(() => useAppraisalForm());

    // Set form data to be invalid for submission (e.g., missing required fields)
    act(() => {
        result.current.setFormData({
            ...initialFormData, // Use initialFormData which has empty required fields
            // Image validation is handled by the useImageHandler mock, not by setting formData
        });
    });


    await act(async () => {
       // Pass a mock event object
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent); // Remove the incorrect argument
    });

    // Wait for potential state updates after submission attempt
    await waitFor(() => {
        // Verify that submitFormData was NOT called
        // We cannot directly verify that validateForm was called without spying on it,
        // but if submitFormData is NOT called, it implies validation failed.

        // Add assertions to check the errors state after submission attempt
        expect(result.current.errors.department).toBe('Seleccione un departamento'); // Check a specific Zod error
        expect(result.current.errors.images).toBe('Cargue al menos una imagen'); // Check the image error

        expect(mockSubmitFormData).not.toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
    });
  });

  test('should set submit error if submitFormData throws an error', async () => {
    // Mock child hook return values for this test to simulate a valid state
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'], // Simulate having an image for validation
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });

    const submissionError = new Error('Submission failed');
    const mockSubmitFormData = jest.fn().mockRejectedValue(submissionError);
    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: mockSubmitFormData,
    });

    // Render the hook with the mocked dependencies
    const { result } = renderHook(() => useAppraisalForm());

    // Set form data to be valid for submission
    act(() => {
        result.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });


    await act(async () => {
       // Pass a mock event object
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent); // Remove the incorrect argument
    });

    expect(mockSubmitFormData).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toContain('Error al enviar el formulario.');
    expect(result.current.errors.submit).toContain(submissionError.message);
  });

  // Note: Testing validateForm directly is complex due to its dependencies on formData,
  // materialQualityEntries, and imageFiles. It's often more effective to test the
  // overall handleSubmit flow and rely on Zod's own tests for schema validation.
  // However, we can add basic tests for image validation within validateForm.
  test('handleSubmit should add image errors based on useImageHandler state', async () => {
    const mockSubmitFormData = jest.fn();
    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: mockSubmitFormData,
    });

    // Test case 1: No images uploaded
    mockUseImageHandler.mockReturnValue({
      images: [], // No images
      imageFiles: [],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    const { result: resultNoImages } = renderHook(() => useAppraisalForm());
     act(() => { // Set valid form data except for images
        resultNoImages.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });
    await act(async () => { await resultNoImages.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent); });
    expect(resultNoImages.current.errors.images).toBe("Cargue al menos una imagen");
    expect(mockSubmitFormData).not.toHaveBeenCalled(); // Submission should fail

    // Test case 2: Too many images uploaded
    const manyImages = Array(31).fill('image.jpg');
    const manyImageFiles = Array(31).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    mockUseImageHandler.mockReturnValue({
      images: manyImages, // Too many images
      imageFiles: manyImageFiles,
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    const { result: resultTooManyImages } = renderHook(() => useAppraisalForm());
     act(() => { // Set valid form data except for images
        resultTooManyImages.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });
    await act(async () => { await resultTooManyImages.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent); });
    expect(resultTooManyImages.current.errors.images).toBe("Puede cargar un máximo de 30 imágenes");
    expect(mockSubmitFormData).not.toHaveBeenCalled(); // Submission should fail

    // Test case 3: Image error from useImageHandler
    const imageHookError = "Error uploading image";
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'], // Some images, but with an error
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: imageHookError,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
     const { result: resultHookError } = renderHook(() => useAppraisalForm());
      act(() => { // Set valid form data except for images
        resultHookError.current.setFormData({
            department: 'Dept', city: 'City', address: 'Address', area: 100,
            stratum: '3', adminFee: 100, expectedValue: 1000, propertyType: 'House',
            materialQualityEntries: []
        });
    });
    await act(async () => { await resultHookError.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent); });
    expect(resultHookError.current.errors.images).toBe(imageHookError);
    expect(mockSubmitFormData).not.toHaveBeenCalled(); // Submission should fail
  });
});

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

const mockSwalFire = require('sweetalert2').fire as jest.Mock;

describe('useAppraisalForm - Legal Sections Opcionality', () => {
  const initialFormData: AppraisalFormData = {
    department: "", city: "", address: "", area: null, stratum: "",
    adminFee: null, expectedValue: 0, propertyType: "", materialQualityEntries: [],
    // Default values for new optional legal section B fields
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    ph_tipo_propiedad: undefined,
    ph_nombre_conjunto: "", // Keep existing fields
    ph_nit_copropiedad: "",
    ph_restriccion_arrendamiento: "",
    ph_cuotas_pendientes: "",
    ph_normativa_interna: "",
    // Keep other optional legal sections fields
    uso_principal: undefined, pot_restriccion_uso: { selectedRestrictions: [], otherRestrictions: "" },
    zona_declaratoria_especial: { // Initialize as an object
      aplica: false,
      tipo: undefined,
      restricciones_comunes: [],
      otras_restricciones: "",
      fuente: "",
    },
    licencia_urbanistica: "", contrato_escrito_vigente: "", preferencia_requisito_futuro_contrato: "",
    responsable_servicios_publicos: "", gravamenes_cargas: "", impuesto_predial_dia: "",
    litigios_proceso_judicial: "", acceso_servicios_publicos: "", condiciones_seguridad_salubridad: "",
    seguros_obligatorios_recomendables: "", documento_certificado_tradicion_libertad: false,
    documento_escritura_publica: false, documento_recibo_impuesto_predial: false,
    documento_paz_salvo_administracion: "", documento_reglamento_ph: "", documentos_otros: "",
    declaracion_veracidad: false, entendimiento_alcance_analisis: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for child hooks and services
    mockUseImageHandler.mockReturnValue({
      images: ['dummy.jpg'], // Simulate having an image for validation
      imageFiles: [new File(['dummy'], 'dummy.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    mockUseMaterialQualityEntries.mockReturnValue({
      materialQualityEntries: [],
      addMaterialQualityEntry: jest.fn(),
      removeMaterialQualityEntry: jest.fn(),
      updateMaterialQualityEntry: jest.fn(),
    });
    mockUseAppraisalSubmission.mockReturnValue({
      submitFormData: jest.fn().mockResolvedValue(undefined), // Default to resolving
    });
     mockPlacesApiService.getPlaces.mockResolvedValue([
      { id: 1, departamento: 'Dept1', ciudades: ['CityA', 'CityB'] },
      { id: 2, departamento: 'Dept2', ciudades: ['CityC'] },
    ] as Department[]);
    // Default mock for SweetAlert2 to confirm by default
    mockSwalFire.mockResolvedValue({ isConfirmed: true });
  });

  test('should initialize with showLegalSections set to true', () => {
    const { result } = renderHook(() => useAppraisalForm());
    expect(result.current.showLegalSections).toBe(true);
  });

  test('should hide legal sections when toggle is switched off and user confirms', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    // Mock SweetAlert2 to simulate user confirming
    mockSwalFire.mockResolvedValue({ isConfirmed: true });

    await act(async () => {
      // Simulate switching the toggle off
      await result.current.setShowLegalSections(false);
    });

    expect(mockSwalFire).toHaveBeenCalled();
    expect(result.current.showLegalSections).toBe(false);
  });

  test('should keep legal sections visible when toggle is switched off and user cancels', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    // Mock SweetAlert2 to simulate user cancelling
    mockSwalFire.mockResolvedValue({ isConfirmed: false });

    await act(async () => {
      // Simulate switching the toggle off
      await result.current.setShowLegalSections(false);
    });

    expect(mockSwalFire).toHaveBeenCalled();
    expect(result.current.showLegalSections).toBe(true);
  });

  test('should keep legal sections visible when toggle is switched on', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    // First, switch it off and confirm to ensure it can be turned off
    mockSwalFire.mockResolvedValue({ isConfirmed: true });
     await act(async () => {
      await result.current.setShowLegalSections(false);
    });
    expect(result.current.showLegalSections).toBe(false);

    // Now, simulate switching it back on
    await act(async () => {
      await result.current.setShowLegalSections(true);
    });

    // SweetAlert should not be called when switching ON
    expect(mockSwalFire).toHaveBeenCalledTimes(1); // Only called when switching OFF
    expect(result.current.showLegalSections).toBe(true);
  });

  // Test Case 1: Successful submission with legal sections completed
  test('should submit successfully when legal sections are completed', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    // Ensure legal sections are shown
    act(() => {
        result.current.setShowLegalSections(true);
    });

    // Set all required fields, including some legal section fields
    act(() => {
        result.current.setFormData({
            ...initialFormData,
            department: 'Dept1', city: 'CityA', address: 'Address 123', area: 100,
            stratum: '3', adminFee: 50000, expectedValue: 1500000, propertyType: 'Apartment',
            // Fill some legal section fields
            // Fill some new legal section B fields
            ph_sometido_ley_675: true,
            ph_reglamento_interno: true,
            ph_reglamento_cubre_aspectos: true,
            ph_escritura_registrada: true,
            ph_tipo_propiedad: 'Residencial',
            // Keep other legal section fields
            uso_principal: 'Residencial', contrato_escrito_vigente: 'Sí',
            gravamenes_cargas: 'Ninguno', acceso_servicios_publicos: 'Sí',
            documento_certificado_tradicion_libertad: true, declaracion_veracidad: true,
            entendimiento_alcance_analisis: true,
        });
    });

    await act(async () => {
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });

    // Verify that submitFormData was called with the correct data
    expect(mockUseAppraisalSubmission().submitFormData).toHaveBeenCalledTimes(1);
    const submittedData = mockUseAppraisalSubmission().submitFormData.mock.calls[0][0];

    // Check if some legal section fields are present in the submitted data
    // Check if new legal section B fields are present and have the correct values
    expect(submittedData.ph_sometido_ley_675).toBe(true);
    expect(submittedData.ph_reglamento_interno).toBe(true);
    expect(submittedData.ph_reglamento_cubre_aspectos).toBe(true);
    expect(submittedData.ph_escritura_registrada).toBe(true);
    expect(submittedData.ph_tipo_propiedad).toBe('Residencial');

    // Check if other legal section fields are present
    expect(submittedData.uso_principal).toBe('Residencial');
    expect(submittedData.contrato_escrito_vigente).toBe('Sí');
    expect(submittedData.declaracion_veracidad).toBe(true);
    expect(submittedData.entendimiento_alcance_analisis).toBe(true);

    // Check some non-legal fields are also present
    expect(submittedData.department).toBe('Dept1');
    expect(submittedData.address).toBe('Address 123');
    expect(submittedData.expectedValue).toBe(1500000);

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toBeUndefined();
  });

  // Test Case 2: Successful submission with legal sections omitted
  test('should submit successfully when legal sections are omitted', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    // Ensure legal sections are hidden and user confirms omission
    mockSwalFire.mockResolvedValue({ isConfirmed: true });
    await act(async () => {
      await result.current.setShowLegalSections(false);
    });
    expect(result.current.showLegalSections).toBe(false);

    // Set only the required fields from non-legal sections
    act(() => {
        result.current.setFormData({
            ...initialFormData, // Start with initial data where legal fields are empty
            department: 'Dept1', city: 'CityA', address: 'Address 123', area: 100,
            stratum: '3', adminFee: 50000, expectedValue: 1500000, propertyType: 'Apartment',
            // Legal section fields should remain at their initial empty/false values
        });
    });

    await act(async () => {
      await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });

    // Verify that submitFormData was called with the correct data
    expect(mockUseAppraisalSubmission().submitFormData).toHaveBeenCalledTimes(1);
    const submittedData = mockUseAppraisalSubmission().submitFormData.mock.calls[0][0];

    // Check that legal section fields are present but with their default/empty values
    // Note: ph_regimen was removed/changed, this expectation might need review based on current schema
    // Assuming ph_regimen is no longer a field or its default is different
    // expect(submittedData.ph_regimen).toBe(""); // This line might need removal or update
    expect(submittedData.uso_principal).toBe(undefined); // Expect undefined for optional enum when omitted
    expect(submittedData.declaracion_veracidad).toBe(false);
    expect(submittedData.entendimiento_alcance_analisis).toBe(false); // Should be false if omitted

    // Check some non-legal fields are present
    expect(submittedData.department).toBe('Dept1');
    expect(submittedData.address).toBe('Address 123');
    expect(submittedData.expectedValue).toBe(1500000);

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toBeUndefined();
    test('should update boolean fields in Section B using handleBooleanChange', () => {
      const { result } = renderHook(() => useAppraisalForm());
  
      // Ensure legal sections are shown for this test
      act(() => {
          result.current.setShowLegalSections(true);
      });
  
      // Test updating a boolean field via handleBooleanChange
      act(() => {
        result.current.handleBooleanChange('ph_sometido_ley_675', true);
      });
      expect(result.current.formData.ph_sometido_ley_675).toBe(true);
  
      act(() => {
        result.current.handleBooleanChange('ph_sometido_ley_675', false);
      });
      expect(result.current.formData.ph_sometido_ley_675).toBe(false);
  
      // Test another boolean field
       act(() => {
        result.current.handleBooleanChange('ph_escritura_registrada', true);
      });
      expect(result.current.formData.ph_escritura_registrada).toBe(true);
    });
  
    test('should update ph_tipo_propiedad using handleStringChange', () => {
      const { result } = renderHook(() => useAppraisalForm());
  
      // Ensure legal sections are shown for this test
      act(() => {
          result.current.setShowLegalSections(true);
      });
  
      // Test updating ph_tipo_propiedad via handleStringChange
      act(() => {
        result.current.handleStringChange('ph_tipo_propiedad', 'Residencial');
        // Test Case 3: Validation failure when uso_principal is "Otro" but uso_principal_otro is empty
        test('should show validation error when uso_principal is "Otro" but uso_principal_otro is empty', async () => {
          const { result } = renderHook(() => useAppraisalForm());
      
          // Ensure legal sections are shown
          act(() => {
              result.current.setShowLegalSections(true);
          });
      
          // Set required non-legal fields and uso_principal to "Otro", but leave uso_principal_otro empty
          act(() => {
              result.current.setFormData({
                  ...initialFormData,
                  department: 'Dept1', city: 'CityA', address: 'Address 123', area: 100,
                  stratum: '3', adminFee: 50000, expectedValue: 1500000, propertyType: 'Apartment',
                  uso_principal: 'Otro', // Set uso_principal to "Otro"
                  uso_principal_otro: '', // Leave uso_principal_otro empty
                  declaracion_veracidad: true, // Fill required legal fields
                  entendimiento_alcance_analisis: true, // Fill required legal fields
              });
          });
      
          await act(async () => {
            await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
          });
      
          // Verify that submitFormData was NOT called
          expect(mockUseAppraisalSubmission().submitFormData).not.toHaveBeenCalled();
      
          // Verify that validation error is set for uso_principal_otro
          await waitFor(() => {
              expect(result.current.errors.uso_principal_otro).toBe("Debe especificar el uso principal.");
              // Check that other required fields that were filled do NOT have errors
              expect(result.current.errors.department).toBeUndefined();
              expect(result.current.errors.declaracion_veracidad).toBeUndefined();
          });
      
          expect(result.current.isSubmitting).toBe(false);
          expect(result.current.errors.submit).toBeUndefined(); // No submit error, it's a validation error
        });
      
        // Test Case 4: Validation success when uso_principal is "Otro" and uso_principal_otro is filled
        test('should submit successfully when uso_principal is "Otro" and uso_principal_otro is filled', async () => {
          const { result } = renderHook(() => useAppraisalForm());
      
          // Ensure legal sections are shown
          act(() => {
              result.current.setShowLegalSections(true);
          });
      
          // Set required non-legal fields, uso_principal to "Otro", and fill uso_principal_otro
          act(() => {
              result.current.setFormData({
                  ...initialFormData,
                  department: 'Dept1', city: 'CityA', address: 'Address 123', area: 100,
                  stratum: '3', adminFee: 50000, expectedValue: 1500000, propertyType: 'Apartment',
                  uso_principal: 'Otro', // Set uso_principal to "Otro"
                  uso_principal_otro: 'Uso específico de prueba', // Fill uso_principal_otro
                  declaracion_veracidad: true, // Fill required legal fields
                  entendimiento_alcance_analisis: true, // Fill required legal fields
              });
          });
      
          await act(async () => {
            await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
          });
      
          // Verify that submitFormData was called
          expect(mockUseAppraisalSubmission().submitFormData).toHaveBeenCalledTimes(1);
          const submittedData = mockUseAppraisalSubmission().submitFormData.mock.calls[0][0];
      
          // Verify that uso_principal and uso_principal_otro are in the submitted data
          expect(submittedData.uso_principal).toBe('Otro');
          expect(submittedData.uso_principal_otro).toBe('Uso específico de prueba');
      
          expect(result.current.isSubmitting).toBe(false);
          expect(result.current.errors.submit).toBeUndefined(); // No submit error
        });
      
        // Test Case 5: Validation success when uso_principal is not "Otro" and uso_principal_otro is ignored
        test('should submit successfully when uso_principal is not "Otro" and uso_principal_otro is ignored', async () => {
          const { result } = renderHook(() => useAppraisalForm());
      
          // Ensure legal sections are shown
          act(() => {
              result.current.setShowLegalSections(true);
          });
      
          // Set required non-legal fields, uso_principal to something other than "Otro", and fill uso_principal_otro (should be ignored)
          act(() => {
              result.current.setFormData({
                  ...initialFormData,
                  department: 'Dept1', city: 'CityA', address: 'Address 123', area: 100,
                  stratum: '3', adminFee: 50000, expectedValue: 1500000, propertyType: 'Apartment',
                  uso_principal: 'Residencial', // Set uso_principal to something else
                  uso_principal_otro: 'Este texto debería ser ignorado', // Fill uso_principal_otro
                  declaracion_veracidad: true, // Fill required legal fields
                  entendimiento_alcance_analisis: true, // Fill required legal fields
              });
          });
      
          await act(async () => {
            await result.current.submitFormData({ preventDefault: jest.fn() } as unknown as React.FormEvent);
          });
      
          // Verify that submitFormData was called
          expect(mockUseAppraisalSubmission().submitFormData).toHaveBeenCalledTimes(1);
          const submittedData = mockUseAppraisalSubmission().submitFormData.mock.calls[0][0];
      
          // Verify that uso_principal is in the submitted data and uso_principal_otro is also present (as it's part of formData)
          // but its value should not have caused a validation error.
          expect(submittedData.uso_principal).toBe('Residencial');
          expect(submittedData.uso_principal_otro).toBe('Este texto debería ser ignorado'); // The value is still in formData
      
          expect(result.current.isSubmitting).toBe(false);
          expect(result.current.errors.submit).toBeUndefined(); // No submit error
          expect(result.current.errors.uso_principal_otro).toBeUndefined(); // No validation error for uso_principal_otro
        });
      
        describe('handlePotRestrictionsChange', () => {
          test('should add a restriction when checked is true', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = "Normas de ocupación";
      
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction, true);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction);
          });
      
          test('should remove a restriction when checked is false', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = "Normas de ocupación";
      
            // First, add the restriction
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction, true);
            });
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction);
      
            // Then, remove it by setting checked to false
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction, false);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).not.toContain(restriction);
          });
      
          test('should handle multiple restrictions', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction1 = "Normas de ocupación";
            const restriction2 = "Protección ambiental";
      
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction1, true);
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction2, true);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction1);
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction2);
      
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction1, false);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).not.toContain(restriction1);
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction2);
          });
      
          test('should update otherRestrictions text', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const otherText = "Restricción específica";
      
            act(() => {
              result.current.handlePotRestrictionsChange('otherRestrictions', otherText);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.otherRestrictions).toBe(otherText);
          });
      
          test('should not modify selectedRestrictions when updating otherRestrictions', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = "Normas de ocupación";
            const otherText = "Restricción específica";
      
            act(() => {
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction, true);
              result.current.handlePotRestrictionsChange('otherRestrictions', otherText);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction);
            expect(result.current.formData.pot_restriccion_uso?.otherRestrictions).toBe(otherText);
          });
      
          test('should not modify otherRestrictions when updating selectedRestrictions', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = "Normas de ocupación";
            const otherText = "Restricción específica";
      
            act(() => {
              result.current.handlePotRestrictionsChange('otherRestrictions', otherText);
              result.current.handlePotRestrictionsChange('selectedRestrictions', restriction, true);
            });
      
            expect(result.current.formData.pot_restriccion_uso?.selectedRestrictions).toContain(restriction);
            expect(result.current.formData.pot_restriccion_uso?.otherRestrictions).toBe(otherText);
          });
        });
        describe('handleZonaDeclaratoriaChange and handleZonaDeclaratoriaRestriccionesChange', () => {
          test('should update zona_declaratoria_especial.aplica using handleZonaDeclaratoriaChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('aplica', true);
            });
            expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true);
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('aplica', false);
            });
            expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(false);
          });
      
          test('should update zona_declaratoria_especial.tipo using handleZonaDeclaratoriaChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const tipo = 'Histórica (Bien de Interés Cultural - BIC)';
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('tipo', tipo);
            });
            expect(result.current.formData.zona_declaratoria_especial?.tipo).toBe(tipo);
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('tipo', 'Ambiental');
            });
            expect(result.current.formData.zona_declaratoria_especial?.tipo).toBe('Ambiental');
          });
      
          test('should add a restriction to restricciones_comunes using handleZonaDeclaratoriaRestriccionesChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = 'Protección del patrimonio arquitectónico';
      
            act(() => {
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, true);
            });
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction);
          });
      
          test('should remove a restriction from restricciones_comunes using handleZonaDeclaratoriaRestriccionesChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction = 'Protección del patrimonio arquitectónico';
      
            // Add the restriction first
            act(() => {
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, true);
            });
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction);
      
            // Then remove it
            act(() => {
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, false);
            });
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).not.toContain(restriction);
          });
      
          test('should handle multiple restrictions in restricciones_comunes', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const restriction1 = 'Protección del patrimonio arquitectónico';
            const restriction2 = 'Normas de intervención';
      
            act(() => {
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction1, true);
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction2, true);
            });
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction1);
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction2);
      
            act(() => {
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction1, false);
            });
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).not.toContain(restriction1);
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction2);
          });
      
          test('should update zona_declaratoria_especial.otras_restricciones using handleZonaDeclaratoriaChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const otherRestrictionsText = 'Restricciones adicionales';
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('otras_restricciones', otherRestrictionsText);
            });
            expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones).toBe(otherRestrictionsText);
          });
      
          test('should update zona_declaratoria_especial.fuente using handleZonaDeclaratoriaChange', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const fuenteText = 'Ley 123 de 2024';
      
            act(() => {
              result.current.handleZonaDeclaratoriaChange('fuente', fuenteText);
            });
            expect(result.current.formData.zona_declaratoria_especial?.fuente).toBe(fuenteText);
          });
      
          test('should not affect other fields when updating zona_declaratoria_especial fields', () => {
            const { result } = renderHook(() => useAppraisalForm());
            const initialAddress = 'Initial Address';
            const restriction = 'Protección del patrimonio arquitectónico';
      
            act(() => {
              result.current.setFormData(prev => ({ ...prev, address: initialAddress }));
              result.current.handleZonaDeclaratoriaChange('aplica', true);
              result.current.handleZonaDeclaratoriaChange('tipo', 'Cultural');
              result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, true);
              result.current.handleZonaDeclaratoriaChange('otras_restricciones', 'Some other restrictions');
              result.current.handleZonaDeclaratoriaChange('fuente', 'Some source');
            });
      
            expect(result.current.formData.address).toBe(initialAddress);
            expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true);
            expect(result.current.formData.zona_declaratoria_especial?.tipo).toBe('Cultural');
            expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction);
            expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones).toBe('Some other restrictions');
            expect(result.current.formData.zona_declaratoria_especial?.fuente).toBe('Some source');
          });
        });
      });
      expect(result.current.formData.ph_tipo_propiedad).toBe('Residencial');
  
      act(() => {
        result.current.handleStringChange('ph_tipo_propiedad', 'Comercial');
      });
      expect(result.current.formData.ph_tipo_propiedad).toBe('Comercial');
  
       act(() => {
        result.current.handleStringChange('ph_tipo_propiedad', ''); // Test setting back to empty/undefined
      });
      // Depending on how handleStringChange is implemented and schema, this might be '' or undefined
      // Based on useAppraisalForm, handleStringChange sets '', and schema allows undefined
      // The form component uses || '' for controlled component, so '' is expected in state
      expect(result.current.formData.ph_tipo_propiedad).toBe('');
    });
  
  
  });


});
