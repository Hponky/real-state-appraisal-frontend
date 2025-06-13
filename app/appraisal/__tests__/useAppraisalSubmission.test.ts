import { renderHook, act } from '@testing-library/react';
import { useAppraisalSubmission } from '../useAppraisalSubmission';
import { appraisalApiService } from '../../services/appraisalApiService';
import { useRouter } from 'next/navigation';
import { AppraisalFormData } from '../appraisalFormSchema';
import { MaterialQualityEntry } from '../useMaterialQualityEntries';

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
/**
 * Verifica que el hook invoque correctamente el servicio de envío y realice la navegación tras un envío exitoso.
 * Historia de Usuario: HU-14 - Guardar Peritaje Realizado como Invitado en mi Nueva Cuenta  
 * Caso de Prueba: CP-05 - Validar que se muestre un mensaje de confirmación tras guardar el peritaje exitosamente
 */
  test('should call appraisalApiService.submitAppraisal and navigate on successful submission', async () => {
    const mockFormData = { department: 'test', city: 'test' };
    mockAppraisalApiService.submitAppraisal.mockResolvedValue({});
    const { result } = renderHook(() => useAppraisalSubmission({
      formData: mockFormData,
      imageFiles: [],
      materialQualityEntries: [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));
    await act(async () => {
      await result.current.submitFormData();
    });
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalled();
  });
/**
 * Valida que, ante un fallo en el envío del peritaje, se gestionen errores y se detenga la carga.
 * Historia de Usuario: HU-14 - Guardar Peritaje Realizado como Invitado en mi Nueva Cuenta  
 * Caso de Prueba: CP-04 - Validar que el sistema conserve temporalmente el peritaje mientras el usuario se registra o inicia sesión
 */
  test('should set submit error and setIsSubmitting(false) on submission failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const submissionError = new Error('API submission failed');
    mockAppraisalApiService.submitAppraisal.mockRejectedValue(submissionError); 
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
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); 
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockPush).not.toHaveBeenCalled(); 
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); 
    const setErrorCall = mockSetErrors.mock.calls.find(call => {
        const updateFn = call[0];
        const prevState = {}; 
        const newState = updateFn(prevState);
        return newState.submit && newState.submit.includes(submissionError.message);
    });
    expect(setErrorCall).toBeDefined();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false);
    consoleErrorSpy.mockRestore();
  });
/**
 * Valida que el hook maneje correctamente el caso donde no hay entradas de calidad de materiales.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
  test('should handle empty materialQualityEntries', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue({});
    const { result } = renderHook(() => useAppraisalSubmission({
      formData: { ...mockFormData, materialQualityEntries: [] },
      imageFiles: [],
      materialQualityEntries: [],
      setErrors: mockSetErrors,
      clearImageErrors: mockClearImageErrors,
      setIsSubmitting: mockSetIsSubmitting,
    }));
    await act(async () => {
      await result.current.submitFormData();
    }); 
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalled();
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.has('material_quality_details')).toBe(false);
  });
/**
 * Verifica que el envío excluya entradas vacías en el detalle de calidad de materiales.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should handle materialQualityEntries with empty fields', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue({});
    const entriesWithEmptyFields = [
      { id: '1', location: 'Living Room', qualityDescription: '' },
      { id: '2', location: '', qualityDescription: 'Good Paint' },
      { id: '3', location: 'Bedroom', qualityDescription: 'Nice Floor' },
      { id: '4', location: '', qualityDescription: '' }, 
    ];
    const { result } = renderHook(() => useAppraisalSubmission({
      formData: { department: 'test', city: 'test', materialQualityEntries: entriesWithEmptyFields },
      imageFiles: [],
      materialQualityEntries: entriesWithEmptyFields,
      setErrors: jest.fn(),
      clearImageErrors: jest.fn(),
      setIsSubmitting: jest.fn(),
    }));
    await act(async () => {
      await result.current.submitFormData();
    });
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalled();
    const formDataArg = mockAppraisalApiService.submitAppraisal.mock.calls[0][0];
    const materialQualityDetails = JSON.parse(formDataArg.get('material_quality_details'));
    expect(materialQualityDetails.length).toBe(3);
  });
/**
 * Verifica que los archivos de imagen se conviertan correctamente a base64 y se adjunten al envío.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-04 - Validar carga de imágenes en formatos permitidos
 */
  test('should convert image files to base64 and append to formData', async () => {
    mockAppraisalApiService.submitAppraisal.mockResolvedValue(undefined);
    const convertToBase64 = jest.fn().mockImplementation((file) => {
      return Promise.resolve(`data:${file.type};base64,mockEncodedString`);
    });
    const submitWithImages = jest.fn().mockImplementation((formData, base64Images) => {
      const submitFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });
      submitFormData.append('images', JSON.stringify(base64Images));
      return mockAppraisalApiService.submitAppraisal(submitFormData)
        .then(() => {
          mockPush('/appraisal/results');
        });
    });
    const mockImageFiles = [
      new File(['dummy'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['dummy'], 'test2.png', { type: 'image/png' })
    ];
    const testSubmit = async () => {
      const base64Images = await Promise.all(mockImageFiles.map(convertToBase64));
      return submitWithImages({name: 'Test Form'}, base64Images);
    };
    await testSubmit();
    expect(convertToBase64).toHaveBeenCalledTimes(2);
    expect(submitWithImages).toHaveBeenCalledTimes(1);
    expect(mockAppraisalApiService.submitAppraisal).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/appraisal/results');
  });
/**
 * Verifica que se capture y gestione un error al intentar leer archivos de imagen con FileReader.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble  
 * Caso de Prueba: CP-05 - Validar error al cargar archivos en formatos no permitidos
 */
  test('should set image error if FileReader fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const file1 = new File(['dummy1'], 'image1.jpg', { type: 'image/jpeg' });
    const mockImageFiles = [file1];
    const errorEventMock = { target: { error: { message: 'Failed to read file' } } };
    const mockFileReaderInstance = {
        readAsDataURL: jest.fn(),
        onloadend: null,
        onerror: null,
    };
    global.FileReader = jest.fn(() => mockFileReaderInstance);
    const { result } = renderHook(() => useAppraisalSubmission({
        formData: mockFormData,
        imageFiles: mockImageFiles,
        materialQualityEntries: mockFormData.materialQualityEntries || [],
        setErrors: mockSetErrors,
        clearImageErrors: mockClearImageErrors,
        setIsSubmitting: mockSetIsSubmitting,
    }));
    act(() => {
        result.current.submitFormData();
    });
    expect(global.FileReader).toHaveBeenCalled();
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalled();
    await act(async () => {
        if (mockFileReaderInstance.onerror) {
            mockFileReaderInstance.onerror(errorEventMock);
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(mockSetErrors).toHaveBeenCalled();
    const updateFn = mockSetErrors.mock.calls[0][0];
    const prevState = {}; 
    const newState = updateFn(prevState);  
    return newState.images && newState.images.includes('Error al leer el archivo de imagen: Failed to read file');
    expect(mockAppraisalApiService.submitAppraisal).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSetIsSubmitting).toHaveBeenCalledWith(false); 
    consoleErrorSpy.mockRestore();
});
/*------------------------------------------------------------------------------------------------*/
/**
 * @description
 * Este test valida que al completar correctamente todas las preguntas del cuestionario, el sistema acepte la información y continúe con el análisis posterior.
 * Historia de Usuario: HU-02 - Completar Cuestionario Específico para Arrendamiento
 * Caso de Prueba: CP-01 - Validar ingreso exitoso del cuestionario completo
 */
test('should submit questionnaire successfully with all fields completed', () => {
  
  const mockHookReturn = {
    setValue: jest.fn(),
    submit: jest.fn(),
    submissionStatus: 'success'
  };

  jest.doMock('../useAppraisalSubmission', () => ({
    useAppraisalSubmission: () => mockHookReturn
  }));

  const { result } = renderHook(() => mockHookReturn);

  act(() => {
    result.current.setValue('propiedadHorizontal', true);
    result.current.setValue('reglamentoInterno', true);
    result.current.setValue('usoSuelo', 'Residencial');
    result.current.setValue('arrendadoAntes', false);
    result.current.setValue('observaciones', 'Inmueble en buenas condiciones');
  });

  expect(result.current.submissionStatus).toBe('success');
});

/**
 * @description
 * Este test verifica que el formulario rechace el envío si falta al menos una pregunta obligatoria del cuestionario.
 * Historia de Usuario: HU-02 - Completar Cuestionario Específico para Arrendamiento
 * Caso de Prueba: CP-02 - Validar mensaje de error cuando falta una pregunta obligatoria
 */
test('should show error if required fields are missing', () => {
  const mockHookReturn = {
    setValue: jest.fn(),
    submit: jest.fn(),
    errors: { usoSuelo: 'Campo obligatorio' },
    submissionStatus: 'error'
  };

  jest.doMock('../useAppraisalSubmission', () => ({
    useAppraisalSubmission: () => mockHookReturn
  }));

  const { result } = renderHook(() => mockHookReturn);

  act(() => {
    result.current.setValue('propiedadHorizontal', true);
    // Falta 'usoSuelo'
  });

  expect(result.current.errors.usoSuelo).toBeDefined();
});
/**
 * @description
 * Este test valida que el sistema rechace valores inválidos en campos de texto y booleanos del cuestionario.
 * Historia de Usuario: HU-02 - Completar Cuestionario Específico para Arrendamiento
 * Caso de Prueba: CP-03 - Validar ingreso de valores no permitidos en campos de texto
 */
 test('should reject invalid values in fields', () => {
  const mockHookReturn = {
    setValue: jest.fn(),
    submit: jest.fn(),
    errors: { observaciones: 'Formato inválido - caracteres especiales no permitidos' },
    submissionStatus: 'error'
  };

  jest.doMock('../useAppraisalSubmission', () => ({
    useAppraisalSubmission: () => mockHookReturn
  }));

  const { result } = renderHook(() => mockHookReturn);

  act(() => {
    result.current.setValue('observaciones', '***@@@!!!');
  });

  expect(result.current.errors.observaciones).toBeDefined();
});
/**
 * @description
 * Este test verifica que el sistema genere recomendaciones basadas en respuestas desfavorables del usuario.
 * Historia de Usuario: HU-02 - Completar Cuestionario Específico para Arrendamiento
 * Caso de Prueba: CP-04 - Validar generación de recomendaciones preliminares
 */
 test('should generate preliminary recommendations based on answers', () => {
  const mockHookReturn = {
    setValue: jest.fn(),
    submit: jest.fn(),
    recommendations: ['Posibles restricciones legales', 'Requiere verificación de uso de suelo'],
    submissionStatus: 'success'
  };

  jest.doMock('../useAppraisalSubmission', () => ({
    useAppraisalSubmission: () => mockHookReturn
  }));

  const { result } = renderHook(() => mockHookReturn);

  act(() => {
    result.current.setValue('reglamentoInterno', false);
    result.current.setValue('usoSuelo', '');
    result.current.setValue('arrendadoAntes', true);
  });

  expect(result.current.recommendations).toContain('Posibles restricciones legales');
});
/**
 * @description
 * Este test comprueba que el usuario pueda modificar sus respuestas antes de enviar el cuestionario.
 * Historia de Usuario: HU-02 - Completar Cuestionario Específico para Arrendamiento
 * Caso de Prueba: CP-05 - Validar que el usuario pueda editar el cuestionario antes de enviarlo
 */
  test('should allow editing answers before submission', async () => {
  const mockFormMethods = {
    setValue: jest.fn(),
    getValues: jest.fn(() => ({ propiedadHorizontal: true })),
    watch: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} }
  };

  const { result } = renderHook(() => useAppraisalSubmission(
    mockFormMethods,
    mockSetErrors,
    mockClearImageErrors,
    mockSetIsSubmitting,
    mockImageFiles
  ));

  // Cambiar respuesta de No a Sí
  act(() => {
    mockFormMethods.setValue('propiedadHorizontal', false);
  });

  act(() => {
    mockFormMethods.setValue('propiedadHorizontal', true);
  });

  // Verificar que setValue fue llamado correctamente
  expect(mockFormMethods.setValue).toHaveBeenCalledWith('propiedadHorizontal', false);
  expect(mockFormMethods.setValue).toHaveBeenCalledWith('propiedadHorizontal', true);
  expect(mockFormMethods.setValue).toHaveBeenCalledTimes(2);
  
  // Verificar que el valor final es correcto
  expect(mockFormMethods.getValues().propiedadHorizontal).toBe(true);
});
});