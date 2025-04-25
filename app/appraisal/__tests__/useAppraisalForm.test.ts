import { renderHook, act, waitFor } from '@testing-library/react'; // Import from @testing-library/react
import { useAppraisalForm } from '../useAppraisalForm';
import { AppraisalFormData, appraisalFormSchema } from '../appraisalFormSchema'; // Import the schema and type
import { placesApiService, Department } from '../../services/placesApi'; // Import Department type
import { useImageHandler } from '../useImageHandler';
import { useMaterialQualityEntries } from '../useMaterialQualityEntries';
import { useAppraisalSubmission } from '../useAppraisalSubmission';

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
      await result.current.submitFormData();
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
      await result.current.submitFormData();
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
      await result.current.submitFormData(); // Remove the incorrect argument
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
      await result.current.submitFormData(); // Remove the incorrect argument
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
    await act(async () => { await resultNoImages.current.submitFormData(); });
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
    await act(async () => { await resultTooManyImages.current.submitFormData(); });
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
    await act(async () => { await resultHookError.current.submitFormData(); });
    expect(resultHookError.current.errors.images).toBe(imageHookError);
    expect(mockSubmitFormData).not.toHaveBeenCalled(); // Submission should fail
  });
});
