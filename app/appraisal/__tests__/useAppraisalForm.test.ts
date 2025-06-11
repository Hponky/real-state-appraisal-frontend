import { renderHook, act, waitFor } from '@testing-library/react';
import useAppraisalForm from '../hooks/useAppraisalForm';
import { AppraisalFormData, AppraisalFormDataSchema, PotRestrictionSchema, ZonaDeclaratoriaEspecialSchema, LegalDeclarationsSchema } from '../hooks/appraisalFormSchema';
import { useImageHandler } from '../hooks/useImageHandler';
import { useMaterialQualityEntries } from '../hooks/useMaterialQualityEntries';
import { useAppraisalSubmission } from '../hooks/useAppraisalSubmission';
import { expect } from '@jest/globals';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('../hooks/useImageHandler');
jest.mock('../hooks/useMaterialQualityEntries');

// Mock useAppraisalSubmission and export its internal mockSubmitFormData
const mockSubmitFormData = jest.fn();
jest.mock('../hooks/useAppraisalSubmission', () => ({
  useAppraisalSubmission: jest.fn(() => ({
    submitFormData: mockSubmitFormData,
  })),
  __esModule: true,
  mockSubmitFormData: mockSubmitFormData, // Export it for direct access in tests
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

const mockUseImageHandler = useImageHandler as jest.Mock;
const mockUseMaterialQualityEntries = useMaterialQualityEntries as jest.Mock;
const mockSwalFire = Swal.fire as jest.Mock;

// Helper function to create a valid initial form data for tests
const createValidInitialFormData = (): AppraisalFormData => ({
  department: "",
  city: "",
  address: "",
  built_area: undefined,
  estrato: "",
  admin_fee: undefined,
  expectedValue: 0,
  property_type: "",
  documento_ficha_predial_catastral: false,
  ph_aplica: false,
  ph_sometido_ley_675: false,
  ph_reglamento_interno: false,
  ph_reglamento_cubre_aspectos: false,
  ph_escritura_registrada: false,
  reglamentoPropiedadHorizontalInscrito: undefined,
  deudasCuotasAdministracion: undefined,
  ph_tipo_propiedad: undefined,
  ph_nombre_conjunto: "",
  ph_nit_copropiedad: "",
  ph_restriccion_arrendamiento: "",
  ph_cuotas_pendientes: "",
  ph_normativa_interna: "",
  pot_restriccion_uso_suelo: { selected: false, description: '' },
  pot_restriccion_edificabilidad: { selected: false, description: '' },
  pot_restriccion_altura: { selected: false, description: '' },
  pot_afectacion_via_publica: { selected: false, description: '' },
  pot_afectacion_ronda_hidrica: { selected: false, description: '' },
  pot_afectacion_infraestructura_servicios_publicos: { selected: false, description: '' },
  pot_otra_restriccion_pot: { selected: false, description: '' },
  pot_otras_restricciones_descripcion: '',
  zona_declaratoria_especial: {
    aplica: false,
    tipo: undefined,
    restricciones_comunes: [],
    restricciones_comunes_descripcion: '',
    otras_restricciones_seleccion: 'No aplica',
    otras_restricciones_descripcion: '',
    fuente: "",
    declaratoriaImponeObligaciones: undefined,
  },
  contrato_escrito_vigente: "",
  preferencia_requisito_futuro_contrato: "",
  responsable_servicios_publicos: "",
  gravamenes_cargas_seleccionados: [],
  gravamen_hipoteca_description: "",
  gravamen_embargo_description: "",
  gravamen_servidumbre_description: "",
  gravamen_prenda_description: "",
  gravamen_usufructo_description: "",
  gravamenes_cargas_otros: "",
  litigios_proceso_judicial_seleccionados: [],
  litigio_demanda_propiedad_description: "",
  litigio_proceso_sucesion_description: "",
  litigio_disputa_linderos_description: "",
  litigio_ejecucion_hipotecaria_description: "",
  litigios_proceso_judicial_otros: "",
  impuestoPredialAlDia: undefined,
  acceso_servicios_publicos: "",
  serviciosConectadosFuncionando: undefined,
  deudasServiciosPublicos: undefined,
  condiciones_seguridad_salubridad: "",
  cumpleNormasSismoresistencia: undefined,
  riesgosEvidentesHabitabilidad: undefined,
  riesgosEvidentesHabitabilidadDescription: "",
  seguros_obligatorios_recomendables: "",
  cuentaPolizaSeguroVigente: undefined,
  documento_certificado_tradicion_libertad: false,
  documento_escritura_publica: false,
  documento_recibo_impuesto_predial: false,
  documento_paz_salvo_administracion: false,
  documento_reglamento_ph: false,
  documentos_otros: "",
  legal_declarations: {
    declaracion_veracidad: false,
    entendimiento_alcance_analisis: false,
    declaracion_propiedad_exclusiva: false,
    declaracion_uso_previsto: false,
    declaracion_cumplimiento_normas: false,
    declaracion_sin_litigios: false,
    declaracion_servidumbres: false,
    declaracion_sin_afectaciones: false,
    declaracion_impuestos_pagados: false,
    declaracion_sin_deudas_asociacion: false,
    declaracion_informacion_completa: false,
    informacionVerazCompleta: false,
    entendimientoAnalisisLegal: false,
    autorizacionTratamientoDatos: false,
  },
  images: [],
});

describe('useAppraisalForm - Core Functionality', () => {
  const initialFormData = createValidInitialFormData();

  beforeEach(() => {
    jest.clearAllMocks();
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

    // Reset the mockSubmitFormData for each test
    mockSubmitFormData.mockClear();
    mockSubmitFormData.mockReset();
    mockSubmitFormData.mockResolvedValue(undefined); // Default successful submission
  });

  test('should initialize with default form data', () => {
    const { result } = renderHook(() => useAppraisalForm());
    expect(result.current.formData).toEqual(initialFormData);
  });

  test('initialFormData should be invalid according to schema', () => {
    const result = AppraisalFormDataSchema.safeParse(initialFormData);
    expect(result.success).toBe(false);
  });

  test('should update form data using setValue', () => {
    const { result } = renderHook(() => useAppraisalForm());
    const newAddress = 'New Address 123';
    act(() => {
      result.current.setValue('address', newAddress, { shouldValidate: true });
    });
    expect(result.current.formData.address).toBe(newAddress);
  });

  test('should handle numeric change for built_area, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('built_area', '100');
    });
    expect(result.current.formData.built_area).toBe(100);

    act(() => {
      result.current.handleNumericChange('built_area', '');
    });
    expect(result.current.formData.built_area).toBeNull();
  });

  test('should handle numeric change for admin_fee, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('admin_fee', '50000');
    });
    expect(result.current.formData.admin_fee).toBe(50000);

    act(() => {
      result.current.handleNumericChange('admin_fee', '');
    });
    expect(result.current.formData.admin_fee).toBeNull();
  });

  test('should handle numeric change for expectedValue, converting empty string to null', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.handleNumericChange('expectedValue', '1500000');
    });
    expect(result.current.formData.expectedValue).toBe(1500000);

    act(() => {
      result.current.handleNumericChange('expectedValue', '');
    });
    expect(result.current.formData.expectedValue).toBeNull(); // Should be null, Zod will validate against min(0)
  });

  test('should call clearImageErrors before validation in handleSubmit', async () => {
    const mockClearImageErrors = jest.fn();

    mockUseImageHandler.mockReturnValue({
      images: ['dummy.jpg'],
      imageFiles: [new File(['dummy'], 'dummy.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: mockClearImageErrors,
    });

    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setValue('department', 'Dept', { shouldValidate: true });
      result.current.setValue('city', 'City', { shouldValidate: true });
      result.current.setValue('address', 'Address', { shouldValidate: true });
      result.current.setValue('built_area', 100, { shouldValidate: true });
      result.current.setValue('estrato', '3', { shouldValidate: true });
      result.current.setValue('admin_fee', 100, { shouldValidate: true });
      result.current.setValue('expectedValue', 1000, { shouldValidate: true });
      result.current.setValue('property_type', 'House', { shouldValidate: true });
      // Set required legal declarations to true for a valid form
      result.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockClearImageErrors).toHaveBeenCalled();
    expect(mockSubmitFormData).toHaveBeenCalled();
  });

  test('should call validateForm and submitFormData on handleSubmit if form is valid', async () => {
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'],
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });

    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setValue('department', 'Dept', { shouldValidate: true });
      result.current.setValue('city', 'City', { shouldValidate: true });
      result.current.setValue('address', 'Address', { shouldValidate: true });
      result.current.setValue('built_area', 100, { shouldValidate: true });
      result.current.setValue('estrato', '3', { shouldValidate: true });
      result.current.setValue('admin_fee', 100, { shouldValidate: true });
      result.current.setValue('expectedValue', 1000, { shouldValidate: true });
      result.current.setValue('property_type', 'House', { shouldValidate: true });
      // Set required legal declarations to true for a valid form
      result.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockSubmitFormData).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toBeUndefined();
  });

  test('should call validateForm but not submitFormData on handleSubmit if form is invalid', async () => {
    // mockSubmitFormData is already defined in beforeEach
    // mockUseAppraisalSubmission.mockReturnValue is already handled in beforeEach

    const { result } = renderHook(() => useAppraisalForm());

    // Form data is initially invalid (missing required fields and images)
    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    await waitFor(() => {
      expect(result.current.errors.department).toBe('El departamento es requerido.');
      expect(result.current.errors.images).toBe('Debe subir al menos una imagen del inmueble.');
      expect(result.current.errors['legal_declarations.informacionVerazCompleta']).toBe('Este campo es requerido.');
      expect(mockSubmitFormData).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  test('should set submit error if submitFormData throws an error', async () => {
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'],
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });

    const submissionError = new Error('Submission failed');
    mockSubmitFormData.mockRejectedValue(submissionError); // Use the existing mock

    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setValue('department', 'Dept', { shouldValidate: true });
      result.current.setValue('city', 'City', { shouldValidate: true });
      result.current.setValue('address', 'Address', { shouldValidate: true });
      result.current.setValue('built_area', 100, { shouldValidate: true });
      result.current.setValue('estrato', '3', { shouldValidate: true });
      result.current.setValue('admin_fee', 100, { shouldValidate: true });
      result.current.setValue('expectedValue', 1000, { shouldValidate: true });
      result.current.setValue('property_type', 'House', { shouldValidate: true });
      // Set required legal declarations to true for a valid form
      result.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockSubmitFormData).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toContain('Error al enviar el formulario.');
    expect(result.current.errors.submit).toContain(submissionError.message);
  });

  test('handleSubmit should add image errors based on useImageHandler state', async () => {
    // mockSubmitFormData is already defined in beforeEach
    // mockUseAppraisalSubmission.mockReturnValue is already handled in beforeEach

    // Test case 1: No images uploaded
    mockUseImageHandler.mockReturnValue({
      images: [],
      imageFiles: [],
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    const { result: resultNoImages } = renderHook(() => useAppraisalForm());
    act(() => { // Set valid form data except for images and legal declarations
      resultNoImages.current.setValue('department', 'Dept', { shouldValidate: true });
      resultNoImages.current.setValue('city', 'City', { shouldValidate: true });
      resultNoImages.current.setValue('address', 'Address', { shouldValidate: true });
      resultNoImages.current.setValue('built_area', 100, { shouldValidate: true });
      resultNoImages.current.setValue('estrato', '3', { shouldValidate: true });
      resultNoImages.current.setValue('admin_fee', 100, { shouldValidate: true });
      resultNoImages.current.setValue('expectedValue', 1000, { shouldValidate: true });
      resultNoImages.current.setValue('property_type', 'House', { shouldValidate: true });
      resultNoImages.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      resultNoImages.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      resultNoImages.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });
    await act(async () => { await resultNoImages.current.handleSubmit(jest.fn()); });
    expect(resultNoImages.current.errors.images).toBe("Debe subir al menos una imagen del inmueble.");
    expect(mockSubmitFormData).not.toHaveBeenCalled();

    // Test case 2: Too many images uploaded
    const manyImages = Array(31).fill('image.jpg');
    const manyImageFiles = Array(31).fill(new File(['dummy'], 'image.jpg', { type: 'image/jpeg' }));
    mockUseImageHandler.mockReturnValue({
      images: manyImages,
      imageFiles: manyImageFiles,
      imageErrors: null,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    const { result: resultTooManyImages } = renderHook(() => useAppraisalForm());
    act(() => { // Set valid form data except for images and legal declarations
      resultTooManyImages.current.setValue('department', 'Dept', { shouldValidate: true });
      resultTooManyImages.current.setValue('city', 'City', { shouldValidate: true });
      resultTooManyImages.current.setValue('address', 'Address', { shouldValidate: true });
      resultTooManyImages.current.setValue('built_area', 100, { shouldValidate: true });
      resultTooManyImages.current.setValue('estrato', '3', { shouldValidate: true });
      resultTooManyImages.current.setValue('admin_fee', 100, { shouldValidate: true });
      resultTooManyImages.current.setValue('expectedValue', 1000, { shouldValidate: true });
      resultTooManyImages.current.setValue('property_type', 'House', { shouldValidate: true });
      resultTooManyImages.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      resultTooManyImages.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      resultTooManyImages.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });
    await act(async () => { await resultTooManyImages.current.handleSubmit(jest.fn()); });
    expect(resultTooManyImages.current.errors.images).toBe("Puede cargar un máximo de 30 imágenes");
    expect(mockSubmitFormData).not.toHaveBeenCalled();

    // Test case 3: Image error from useImageHandler
    const imageHookError = "Error uploading image";
    mockUseImageHandler.mockReturnValue({
      images: ['image1.jpg'],
      imageFiles: [new File(['dummy'], 'image1.jpg', { type: 'image/jpeg' })],
      imageErrors: imageHookError,
      handleImageUpload: jest.fn(),
      removeImage: jest.fn(),
      clearImageErrors: jest.fn(),
    });
    const { result: resultHookError } = renderHook(() => useAppraisalForm());
    act(() => { // Set valid form data except for images and legal declarations
      resultHookError.current.setValue('department', 'Dept', { shouldValidate: true });
      resultHookError.current.setValue('city', 'City', { shouldValidate: true });
      resultHookError.current.setValue('address', 'Address', { shouldValidate: true });
      resultHookError.current.setValue('built_area', 100, { shouldValidate: true });
      resultHookError.current.setValue('estrato', '3', { shouldValidate: true });
      resultHookError.current.setValue('admin_fee', 100, { shouldValidate: true });
      resultHookError.current.setValue('expectedValue', 1000, { shouldValidate: true });
      resultHookError.current.setValue('property_type', 'House', { shouldValidate: true });
      resultHookError.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      resultHookError.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      resultHookError.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });
    await act(async () => { await resultHookError.current.handleSubmit(jest.fn()); });
    expect(resultHookError.current.errors.images).toBe(imageHookError);
    expect(mockSubmitFormData).not.toHaveBeenCalled();
  });
});

describe('useAppraisalForm - Legal Sections Optionality and Specific Field Handling', () => {
  const initialFormData = createValidInitialFormData();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseImageHandler.mockReturnValue({
      images: ['dummy.jpg'],
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

    // Reset the mockSubmitFormData for each test
    mockSubmitFormData.mockClear();
    mockSubmitFormData.mockReset();
    mockSubmitFormData.mockResolvedValue(undefined); // Ensure it's reset for this describe block too
    mockSwalFire.mockResolvedValue({ isConfirmed: true });
  });

  test('should initialize with showLegalSections set to true', () => {
    const { result } = renderHook(() => useAppraisalForm());
    expect(result.current.showLegalSections).toBe(true);
  });

  test('should hide legal sections when toggle is switched off and user confirms', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    mockSwalFire.mockResolvedValue({ isConfirmed: true });

    await act(async () => {
      await result.current.setShowLegalSections(false);
    });

    expect(mockSwalFire).toHaveBeenCalled();
    expect(result.current.showLegalSections).toBe(false);
  });

  test('should keep legal sections visible when toggle is switched off and user cancels', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    mockSwalFire.mockResolvedValue({ isConfirmed: false });

    await act(async () => {
      await result.current.setShowLegalSections(false);
    });

    expect(mockSwalFire).toHaveBeenCalled();
    expect(result.current.showLegalSections).toBe(true);
  });

  test('should keep legal sections visible when toggle is switched on', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    mockSwalFire.mockResolvedValue({ isConfirmed: true });
    await act(async () => {
      await result.current.setShowLegalSections(false);
    });
    expect(result.current.showLegalSections).toBe(false);

    await act(async () => {
      await result.current.setShowLegalSections(true);
    });

    expect(mockSwalFire).toHaveBeenCalledTimes(1);
    expect(result.current.showLegalSections).toBe(true);
  });

  test('should submit successfully when legal sections are completed', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setShowLegalSections(true);
    });

    act(() => {
      result.current.setValue('department', 'Dept1', { shouldValidate: true });
      result.current.setValue('city', 'CityA', { shouldValidate: true });
      result.current.setValue('address', 'Address 123', { shouldValidate: true });
      result.current.setValue('built_area', 100, { shouldValidate: true });
      result.current.setValue('estrato', '3', { shouldValidate: true });
      result.current.setValue('admin_fee', 50000, { shouldValidate: true });
      result.current.setValue('expectedValue', 1500000, { shouldValidate: true });
      result.current.setValue('property_type', 'Apartment', { shouldValidate: true });
      result.current.setValue('ph_aplica', true, { shouldValidate: true });
      result.current.setValue('ph_sometido_ley_675', true, { shouldValidate: true });
      result.current.setValue('ph_reglamento_interno', true, { shouldValidate: true });
      result.current.setValue('ph_reglamento_cubre_aspectos', true, { shouldValidate: true });
      result.current.setValue('ph_escritura_registrada', true, { shouldValidate: true });
      result.current.setValue('reglamentoPropiedadHorizontalInscrito', true, { shouldValidate: true });
      result.current.setValue('deudasCuotasAdministracion', false, { shouldValidate: true });
      result.current.setValue('ph_tipo_propiedad', 'Residencial', { shouldValidate: true });
      result.current.setValue('ph_nombre_conjunto', 'Conjunto Test', { shouldValidate: true });
      result.current.setValue('ph_nit_copropiedad', '123456789', { shouldValidate: true });
      result.current.setValue('pot_restriccion_uso_suelo', { selected: true, description: 'Uso de suelo restringido' }, { shouldValidate: true });
      result.current.setValue('zona_declaratoria_especial.aplica', true, { shouldValidate: true });
      result.current.setValue('zona_declaratoria_especial.tipo', 'Cultural', { shouldValidate: true });
      result.current.setValue('zona_declaratoria_especial.fuente', 'Decreto 123', { shouldValidate: true });
      result.current.setValue('zona_declaratoria_especial.declaratoriaImponeObligaciones', false, { shouldValidate: true });
      result.current.setValue('contrato_escrito_vigente', 'Sí', { shouldValidate: true });
      result.current.setValue('gravamenes_cargas_seleccionados', ['Ninguno'], { shouldValidate: true });
      result.current.setValue('litigios_proceso_judicial_seleccionados', ['Ninguno'], { shouldValidate: true });
      result.current.setValue('impuestoPredialAlDia', true, { shouldValidate: true });
      result.current.setValue('acceso_servicios_publicos', 'Sí', { shouldValidate: true });
      result.current.setValue('serviciosConectadosFuncionando', true, { shouldValidate: true });
      result.current.setValue('deudasServiciosPublicos', false, { shouldValidate: true });
      result.current.setValue('condiciones_seguridad_salubridad', 'Buenas', { shouldValidate: true });
      result.current.setValue('cumpleNormasSismoresistencia', true, { shouldValidate: true });
      result.current.setValue('riesgosEvidentesHabitabilidad', false, { shouldValidate: true });
      result.current.setValue('seguros_obligatorios_recomendables', 'Sí', { shouldValidate: true });
      result.current.setValue('cuentaPolizaSeguroVigente', true, { shouldValidate: true });
      result.current.setValue('documento_ficha_predial_catastral', true, { shouldValidate: true });
      result.current.setValue('documento_certificado_tradicion_libertad', true, { shouldValidate: true });
      result.current.setValue('documento_escritura_publica', true, { shouldValidate: true });
      result.current.setValue('documento_recibo_impuesto_predial', true, { shouldValidate: true });
      result.current.setValue('documento_paz_salvo_administracion', true, { shouldValidate: true });
      result.current.setValue('documento_reglamento_ph', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_veracidad', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimiento_alcance_analisis', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_propiedad_exclusiva', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_uso_previsto', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_cumplimiento_normas', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_sin_litigios', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_servidumbres', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_sin_afectaciones', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_impuestos_pagados', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_sin_deudas_asociacion', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.declaracion_informacion_completa', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockSubmitFormData).toHaveBeenCalledTimes(1);
    const submittedData = mockSubmitFormData.mock.calls[0][0];

    expect(submittedData.ph_sometido_ley_675).toBe(true);
    expect(submittedData.ph_tipo_propiedad).toBe('Residencial');
    expect(submittedData.zona_declaratoria_especial.aplica).toBe(true);
    expect(submittedData.zona_declaratoria_especial.tipo).toBe('Cultural');
    expect(submittedData.legal_declarations.declaracion_veracidad).toBe(true);
    expect(submittedData.department).toBe('Dept1');
    expect(submittedData.address).toBe('Address 123');
    expect(submittedData.expectedValue).toBe(1500000);

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toBeUndefined();
  });

  test('should submit successfully when legal sections are omitted', async () => {
    const { result } = renderHook(() => useAppraisalForm());

    mockSwalFire.mockResolvedValue({ isConfirmed: true });
    await act(async () => {
      await result.current.setShowLegalSections(false);
    });
    expect(result.current.showLegalSections).toBe(false);

    act(() => {
      result.current.setValue('department', 'Dept1', { shouldValidate: true });
      result.current.setValue('city', 'CityA', { shouldValidate: true });
      result.current.setValue('address', 'Address 123', { shouldValidate: true });
      result.current.setValue('built_area', 100, { shouldValidate: true });
      result.current.setValue('estrato', '3', { shouldValidate: true });
      result.current.setValue('admin_fee', 50000, { shouldValidate: true });
      result.current.setValue('expectedValue', 1500000, { shouldValidate: true });
      result.current.setValue('property_type', 'Apartment', { shouldValidate: true });
      // Set required legal declarations to true for a valid form, even if sections are hidden
      // This simulates the behavior where the schema still expects these if not explicitly omitted by the hook logic
      result.current.setValue('legal_declarations.informacionVerazCompleta', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.entendimientoAnalisisLegal', true, { shouldValidate: true });
      result.current.setValue('legal_declarations.autorizacionTratamientoDatos', true, { shouldValidate: true });
    });

    await act(async () => {
      await result.current.handleSubmit(jest.fn());
    });

    expect(mockSubmitFormData).toHaveBeenCalledTimes(1);
    const submittedData = mockSubmitFormData.mock.calls[0][0];

    // Check that legal section fields are present but with their default/empty values
    expect(submittedData.ph_aplica).toBe(false);
    expect(submittedData.ph_tipo_propiedad).toBe(undefined);
    expect(submittedData.zona_declaratoria_especial.aplica).toBe(false);
    expect(submittedData.zona_declaratoria_especial.tipo).toBe(undefined);
    expect(submittedData.legal_declarations.declaracion_veracidad).toBe(false); // This should be false if not set
    expect(submittedData.legal_declarations.entendimiento_alcance_analisis).toBe(false); // This should be false if not set

    expect(submittedData.department).toBe('Dept1');
    expect(submittedData.address).toBe('Address 123');
    expect(submittedData.expectedValue).toBe(1500000);

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.submit).toBeUndefined();
  });

  test('should update boolean fields in Section B using handleBooleanChange', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setShowLegalSections(true);
    });

    act(() => {
      result.current.handleBooleanChange('ph_sometido_ley_675', true);
    });
    expect(result.current.formData.ph_sometido_ley_675).toBe(true);

    act(() => {
      result.current.handleBooleanChange('ph_sometido_ley_675', false);
    });
    expect(result.current.formData.ph_sometido_ley_675).toBe(false);

    act(() => {
      result.current.handleBooleanChange('ph_escritura_registrada', true);
    });
    expect(result.current.formData.ph_escritura_registrada).toBe(true);
  });

  test('should update ph_tipo_propiedad using handleStringChange', () => {
    const { result } = renderHook(() => useAppraisalForm());

    act(() => {
      result.current.setShowLegalSections(true);
    });

    act(() => {
      result.current.handleStringChange('ph_tipo_propiedad', 'Residencial');
    });
    expect(result.current.formData.ph_tipo_propiedad).toBe('Residencial');

    act(() => {
      result.current.handleStringChange('ph_tipo_propiedad', 'Comercial');
    });
    expect(result.current.formData.ph_tipo_propiedad).toBe('Comercial');

    act(() => {
      result.current.handleStringChange('ph_tipo_propiedad', '');
    });
    expect(result.current.formData.ph_tipo_propiedad).toBe('');
  });

  describe('handlePotRestrictionChange', () => {
    test('should update selected and description for a specific POT restriction', () => {
      const { result } = renderHook(() => useAppraisalForm());

      act(() => {
        result.current.handlePotRestrictionChange('pot_restriccion_uso_suelo', true, 'Descripción de uso de suelo');
      });
      expect(result.current.formData.pot_restriccion_uso_suelo.selected).toBe(true);
      expect(result.current.formData.pot_restriccion_uso_suelo.description).toBe('Descripción de uso de suelo');

      act(() => {
        result.current.handlePotRestrictionChange('pot_restriccion_uso_suelo', false, '');
      });
      expect(result.current.formData.pot_restriccion_uso_suelo.selected).toBe(false);
      expect(result.current.formData.pot_restriccion_uso_suelo.description).toBe('');
    });

    test('should update only selected if description is not provided', () => {
      const { result } = renderHook(() => useAppraisalForm());

      act(() => {
        result.current.handlePotRestrictionChange('pot_restriccion_edificabilidad', true);
      });
      expect(result.current.formData.pot_restriccion_edificabilidad.selected).toBe(true);
      expect(result.current.formData.pot_restriccion_edificabilidad.description).toBe('');

      act(() => {
        result.current.handlePotRestrictionChange('pot_restriccion_edificabilidad', false);
      });
      expect(result.current.formData.pot_restriccion_edificabilidad.selected).toBe(false);
      expect(result.current.formData.pot_restriccion_edificabilidad.description).toBe('');
    });

    test('should update only description if selected is not provided', () => {
      const { result } = renderHook(() => useAppraisalForm());

      act(() => {
        result.current.handlePotRestrictionChange('pot_restriccion_altura', false, 'Nueva descripción de altura');
      });
      expect(result.current.formData.pot_restriccion_altura.selected).toBe(false);
      expect(result.current.formData.pot_restriccion_altura.description).toBe('Nueva descripción de altura');
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

      act(() => {
        result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, true);
      });
      expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction);

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

    test('should update zona_declaratoria_especial.otras_restricciones_seleccion and .otras_restricciones_descripcion using handleZonaDeclaratoriaChange', () => {
      const { result } = renderHook(() => useAppraisalForm());

      act(() => {
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_seleccion', 'Sí, especificar');
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_descripcion', 'Restricciones adicionales específicas');
      });
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_seleccion).toBe('Sí, especificar');
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_descripcion).toBe('Restricciones adicionales específicas');

      act(() => {
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_seleccion', 'No aplica');
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_descripcion', '');
      });
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_seleccion).toBe('No aplica');
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_descripcion).toBe('');
    });

    test('should update zona_declaratoria_especial.fuente using handleZonaDeclaratoriaChange', () => {
      const { result } = renderHook(() => useAppraisalForm());
      const fuenteText = 'Ley 123 de 2024';

      act(() => {
        result.current.handleZonaDeclaratoriaChange('fuente', fuenteText);
      });
      expect(result.current.formData.zona_declaratoria_especial?.fuente).toBe(fuenteText);
    });

    test('should update zona_declaratoria_especial.declaratoriaImponeObligaciones using handleZonaDeclaratoriaChange', () => {
      const { result } = renderHook(() => useAppraisalForm());

      act(() => {
        result.current.handleZonaDeclaratoriaChange('declaratoriaImponeObligaciones', true);
      });
      expect(result.current.formData.zona_declaratoria_especial?.declaratoriaImponeObligaciones).toBe(true);

      act(() => {
        result.current.handleZonaDeclaratoriaChange('declaratoriaImponeObligaciones', false);
      });
      expect(result.current.formData.zona_declaratoria_especial?.declaratoriaImponeObligaciones).toBe(false);
    });

    test('should not affect other fields when updating zona_declaratoria_especial fields', () => {
      const { result } = renderHook(() => useAppraisalForm());
      const initialAddress = 'Initial Address';
      const restriction = 'Protección del patrimonio arquitectónico';

      act(() => {
        result.current.setValue('address', initialAddress);
        result.current.handleZonaDeclaratoriaChange('aplica', true);
        result.current.handleZonaDeclaratoriaChange('tipo', 'Cultural');
        result.current.handleZonaDeclaratoriaRestriccionesChange(restriction, true);
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_seleccion', 'Sí, especificar');
        result.current.handleZonaDeclaratoriaChange('otras_restricciones_descripcion', 'Some other restrictions');
        result.current.handleZonaDeclaratoriaChange('fuente', 'Some source');
        result.current.handleZonaDeclaratoriaChange('declaratoriaImponeObligaciones', true);
      });

      expect(result.current.formData.address).toBe(initialAddress);
      expect(result.current.formData.zona_declaratoria_especial?.aplica).toBe(true);
      expect(result.current.formData.zona_declaratoria_especial?.tipo).toBe('Cultural');
      expect(result.current.formData.zona_declaratoria_especial?.restricciones_comunes).toContain(restriction);
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_seleccion).toBe('Sí, especificar');
      expect(result.current.formData.zona_declaratoria_especial?.otras_restricciones_descripcion).toBe('Some other restrictions');
      expect(result.current.formData.zona_declaratoria_especial?.fuente).toBe('Some source');
      expect(result.current.formData.zona_declaratoria_especial?.declaratoriaImponeObligaciones).toBe(true);
    });
  });
});
