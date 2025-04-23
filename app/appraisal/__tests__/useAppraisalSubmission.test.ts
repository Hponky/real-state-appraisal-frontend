import { renderHook, act } from '@testing-library/react';
import { useAppraisalSubmission } from '../useAppraisalSubmission';
import { appraisalApiService } from '../../services/appraisalApiService';
import { useRouter } from 'next/navigation';
import { AppraisalFormData } from '../appraisalFormSchema';
import { MaterialQualityEntry } from '../useMaterialQualityEntries';

// Mock dependencies
jest.mock('../../services/appraisalApiService');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
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

  // Add tests for image conversion to base64 if needed, but Promise.all and FileReader
  // are standard browser APIs and typically don't require extensive unit testing
  // unless there's custom logic involved.
});