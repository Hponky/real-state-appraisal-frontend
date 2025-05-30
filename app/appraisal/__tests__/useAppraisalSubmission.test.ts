import { renderHook, act } from '@testing-library/react';
import { useAppraisalSubmission } from '../hooks/useAppraisalSubmission';
import { appraisalApiService } from '../../services/appraisalApiService';
import { useRouter } from 'next/navigation';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { MaterialQualityEntry } from '../hooks/useMaterialQualityEntries';

// Mock dependencies
jest.mock('../../services/appraisalApiService');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const mockAppraisalApiService = appraisalApiService as jest.Mocked<typeof appraisalApiService>;
const mockUseRouter = useRouter as jest.Mock;

describe('useAppraisalSubmission', () => {
  const mockSetErrors = jest.fn();
  const mockClearImageErrors = jest.fn();
  const mockSetIsSubmitting = jest.fn();
  const mockPush = jest.fn();

  const mockFormData: AppraisalFormData = {
    department: 'Dept1',
    city: 'CityA',
    address: 'Address 123',
    area: 100,
    stratum: '3',
    adminFee: 50000,
    expectedValue: 1500000,
    propertyType: 'Apartamento',
    materialQualityEntries: [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }],
  };

  const mockImageFiles: File[] = [
    new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' }),
    new File(['dummy'], 'image2.png', { type: 'image/png' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  test('should call appraisalApiService.submitAppraisal and navigate on successful submission', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined); // Simulate success

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: mockFormData.materialQualityEntries || [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    await act(async () => {
      await result.current.submitFormData();
    });

    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error

    // Verify formDataToSend content (basic check)
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.get('departamento')).toBe(mockFormData.department);
    expect(formDataArg.get('ciudad')).toBe(mockFormData.city);
    // Add more checks for other fields and image data if needed

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error
  });

  test('should set submit error and setIsSubmitting(false) on submission failure', async () => {
    // Mock console.error for this specific test to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const submissionError = new Error('API submission failed');
    mockAppraisalApiService.submitAppraisal.mockRejectedValue(submissionError); // Simulate failure

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: mockFormData.materialQualityEntries || [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    await act(async () => {
      await result.current.submitFormData();
    });

    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockPush).not.toHaveBeenCalled(); // Navigation should not happen on failure
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to set submit error
    const setErrorCall = mockSetErrors.mock.calls.find(call => {
        const updateFn = call[0];
        const prevState = {}; // Simulate previous state
        const newState = updateFn(prevState);
        return newState.submit && newState.submit.includes(submissionError.message);
    });
    expect(setErrorCall).toBeDefined();

    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('should handle empty materialQualityEntries', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: { ...mockFormData, materialQualityEntries: [] }, // Empty entries
      imageFiles: mockImageFiles,
      materialQualityEntries: [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    await act(async () => {
      await result.current.submitFormData();
    });

    // Verify formDataToSend content - material_quality_details should not be appended
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    expect(formDataArg.has('material_quality_details')).toBe(false);

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
  });

  test('should handle materialQualityEntries with empty fields', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);

    const entriesWithEmptyFields: MaterialQualityEntry[] = [
        { id: '1', location: 'Living Room', qualityDescription: '' },
        { id: '2', location: '', qualityDescription: 'Good Paint' },
        { id: '3', location: 'Bedroom', qualityDescription: 'Nice Floor' },
        { id: '4', location: '', qualityDescription: '' }, // Should be filtered out
    ];

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: { ...mockFormData, materialQualityEntries: entriesWithEmptyFields },
      imageFiles: mockImageFiles,
      materialQualityEntries: entriesWithEmptyFields,
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    await act(async () => {
      await result.current.submitFormData();
    });

    // Verify formDataToSend content - only valid entries should be included
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    const materialQualityDetails = JSON.parse(formDataArg.get('material_quality_details') as string);

    expect(materialQualityDetails.length).toBe(3); // Only 3 valid entries
    expect(materialQualityDetails).toEqual(expect.arrayContaining([
        { id: '1', location: 'Living Room', qualityDescription: '' },
        { id: '2', location: '', qualityDescription: 'Good Paint' },
        { id: '3', location: 'Bedroom', qualityDescription: 'Nice Floor' },
    ]));


    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
  });

  test('should convert image files to base64 and append to formData', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);

    // Mock FileReader
    const mockReadAsDataURL = jest.fn();
    const mockFileReader = {
      onloadend: null as any,
      onerror: null as any,
      readAsDataURL: mockReadAsDataURL,
    };
    jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['dummy2'], 'image2.png', { type: 'image/png' });
    const mockImageFiles: File[] = [file1, file2];

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: mockFormData.materialQualityEntries || [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    // Trigger the submission
    act(() => {
      result.current.submitFormData();
    });

    // Simulate FileReader loading
    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend({ target: { result: 'data:image/jpeg;base64,encoded1' } } as any);
      }
    });
     await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend({ target: { result: 'data:image/png;base64,encoded2' } } as any);
      }
    });


    // Wait for the submission promise to resolve
    await act(async () => {
        // No explicit await needed here as the previous act blocks until promises resolve
    });


    // Verify FileReader was called for each file
    expect(mockReadAsDataURL).toHaveBeenCalledTimes(2);
    expect(mockReadAsDataURL).toHaveBeenCalledWith(file1);
    expect(mockReadAsDataURL).toHaveBeenCalledWith(file2);

    // Verify submitAppraisal was called with FormData containing base64 images
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);

    const imagesData = JSON.parse(formDataArg.get('images') as string);
    expect(imagesData).toEqual([
      'data:image/jpeg;base64,encoded1',
      'data:image/png;base64,encoded2',
    ]);

    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
  });

  test('should set image error if FileReader fails', async () => {
    // Mock console.error for this specific test to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined); // Submission would succeed if not for image error

    // Mock FileReader to simulate an error
    const mockReadAsDataURL = jest.fn();
    const mockFileReader = {
      onloadend: null as any,
      onerror: null as any,
      readAsDataURL: mockReadAsDataURL,
    };
    jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const mockImageFiles: File[] = [file1];

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: mockFormData.materialQualityEntries || [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));

    // Trigger the submission
    act(() => {
      result.current.submitFormData();
    });

    // Simulate FileReader error
    const errorEvent = new ErrorEvent('error', { message: 'Failed to read file' });
    await act(async () => {
      if (mockFileReader.onerror) {
        mockFileReader.onerror(errorEvent);
      }
    });

    // Wait for potential state updates
     await act(async () => {
        // No explicit await needed here
    });


    // Verify setErrors was called with an image error
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function));
    const setErrorCall = mockSetErrors.mock.calls.find(call => {
        const updateFn = call[0];
        const prevState = {}; // Simulate previous state
        const newState = updateFn(prevState);
        return newState.images && newState.images.includes('Error al leer el archivo de imagen: Failed to read file');
    });
    expect(setErrorCall).toBeDefined();

    // Verify submitAppraisal was NOT called
    expect(mockAppraisalApiService.submitAppraisal).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});