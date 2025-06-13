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
  const mockSetValue = jest.fn(); // Mock para setValue
  const mockTrigger = jest.fn(); // Mock para trigger

  const mockFormData: AppraisalFormData = {
    department: 'Dept1',
    city: 'CityA',
    address: 'Address 123',
    documento_ficha_predial_catastral: true,
    property_type: 'Apartamento',
    estrato: '3',
    built_area: 100,
    pot_restriccion_uso_suelo: { selected: false },
    pot_restriccion_edificabilidad: { selected: false },
    pot_restriccion_altura: { selected: false },
    pot_afectacion_via_publica: { selected: false },
    pot_afectacion_ronda_hidrica: { selected: false },
    pot_afectacion_infraestructura_servicios_publicos: { selected: false },
    pot_otra_restriccion_pot: { selected: false },
    zona_declaratoria_especial: { aplica: false, otras_restricciones_seleccion: "No aplica" },
    contrato_escrito_vigente: 'Sí',
    preferencia_requisito_futuro_contrato: 'No',
    responsable_servicios_publicos: 'Arrendatario',
    gravamenes_cargas_seleccionados: [],
    litigios_proceso_judicial_seleccionados: [],
    impuestoPredialAlDia: true,
    acceso_servicios_publicos: 'Todos',
    serviciosConectadosFuncionando: true,
    deudasServiciosPublicos: false,
    condiciones_seguridad_salubridad: 'Buenas',
    cumpleNormasSismoresistencia: true,
    riesgosEvidentesHabitabilidad: false,
    seguros_obligatorios_recomendables: 'Sí',
    cuentaPolizaSeguroVigente: true,
    documento_certificado_tradicion_libertad: true,
    documento_escritura_publica: true,
    documento_recibo_impuesto_predial: true,
    documento_paz_salvo_administracion: true,
    documento_reglamento_ph: true,
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
    images: [], // Las imágenes se pasan por separado
    admin_fee: 50000,
    ph_aplica: false,
    ph_sometido_ley_675: false,
    ph_reglamento_interno: false,
    ph_reglamento_cubre_aspectos: false,
    ph_escritura_registrada: false,
    reglamentoPropiedadHorizontalInscrito: false,
    deudasCuotasAdministracion: false,
  };

  const mockImageFiles: File[] = [
    new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' }),
    new File(['dummy'], 'image2.png', { type: 'image/png' }),
  ];

  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    // Mock console.error and console.log to prevent test output noise
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  afterAll(() => {
    // Restore console.error and console.log after all tests are done
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('should call appraisalApiService.submitAppraisal and navigate on successful submission', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined); // Simulate success

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue, // Añadir mockSetValue
      trigger: mockTrigger,   // Añadir mockTrigger
    }));

    await act(async () => {
      await result.current.submitFormData(mockFormData);
    });

    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error

    // Verify formDataToSend content (basic check)
    const submitAppraisalArgs = mockAppraisalApiService.submitAppraisal.mock.calls[0];
    expect(submitAppraisalArgs[0]).toBeDefined(); // requestId
    expect(submitAppraisalArgs[1]).toBeDefined(); // dataForN8n

    const dataForN8n = submitAppraisalArgs[1];
    expect(dataForN8n.department).toBe(mockFormData.department);
    expect(dataForN8n.city).toBe(mockFormData.city);
    // Add more checks for other fields and image data if needed

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error
  });

  test('should set submit error and setIsSubmitting(false) on submission failure', async () => {
    // Mock console.error for this specific test to avoid noise in test output

    const submissionError = new Error('API submission failed');
    mockAppraisalApiService.submitAppraisal.mockRejectedValue(submissionError); // Simulate failure

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    }));

    await act(async () => {
      await result.current.submitFormData(mockFormData);
    });

    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(true);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Check if setErrors was called to clear submit error

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
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
  });

  test('should handle empty materialQualityEntries', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    }));

    await act(async () => {
      await result.current.submitFormData(mockFormData);
    });

    // Verify formDataToSend content - material_quality_details should not be appended
    const submitAppraisalArgs = mockAppraisalApiService.submitAppraisal.mock.calls[0];
    const dataForN8n = submitAppraisalArgs[1];
    expect(dataForN8n.materialQualityEntries).toEqual([]);

    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
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
      formData: mockFormData,
      imageFiles: mockImageFiles,
      materialQualityEntries: entriesWithEmptyFields,
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    }));

    await act(async () => {
      await result.current.submitFormData(mockFormData);
    });

    // Verify formDataToSend content - only valid entries should be included
    const submitAppraisalArgs = mockAppraisalApiService.submitAppraisal.mock.calls[0];
    const dataForN8n = submitAppraisalArgs[1];
    const materialQualityDetails = dataForN8n.materialQualityEntries;

    expect(materialQualityDetails.length).toBe(3); // Only 3 valid entries
    expect(materialQualityDetails).toEqual(expect.arrayContaining([
        { id: '1', location: 'Living Room', qualityDescription: '' },
        { id: '2', location: '', qualityDescription: 'Good Paint' },
        { id: '3', location: 'Bedroom', qualityDescription: 'Nice Floor' },
    ]));


    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
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
      materialQualityEntries: [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    }));

    // Trigger the submission
    act(() => {
      result.current.submitFormData(mockFormData);
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
    const submitAppraisalArgs = mockAppraisalApiService.submitAppraisal.mock.calls[0];
    expect(submitAppraisalArgs[0]).toBeDefined(); // requestId
    expect(submitAppraisalArgs[1]).toBeDefined(); // dataForN8n

    const dataForN8n = submitAppraisalArgs[1];
    const imagesData = dataForN8n.imagesBase64;
    expect(imagesData).toEqual([
      'data:image/jpeg;base64,encoded1',
      'data:image/png;base64,encoded2',
    ]);

    expect(mockPush).toHaveBeenCalledWith("/appraisal/results");
  });

  test('should set image error if FileReader fails', async () => {
    // Mock console.error for this specific test to avoid noise in test output

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
      materialQualityEntries: [{ id: '1', location: 'Kitchen', qualityDescription: 'Good' }],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    }));

    // Trigger the submission
    act(() => {
      result.current.submitFormData(mockFormData);
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
  });
});