import fetchMock from 'jest-fetch-mock';
import { appraisalApiService, AppraisalSubmissionPayload } from '../appraisalApiService';
import { AppraisalFormData, AppraisalResult, MaterialQualityEntry } from '../../appraisal/types/appraisal-results';

fetchMock.enableMocks();

describe('appraisalApiService', () => {
  let mockCreateObjectURL: jest.SpyInstance;
  let mockRevokeObjectURL: jest.SpyInstance;
  let mockAppendChild: jest.SpyInstance;
  let mockRemoveChild: jest.SpyInstance;

  beforeEach(() => {
    fetchMock.resetMocks();

    // Ensure window.URL and its methods exist before spying
    if (!window.URL) {
      (window as any).URL = {};
    }
    if (!window.URL.createObjectURL) {
      (window.URL as any).createObjectURL = jest.fn();
    }
    if (!window.URL.revokeObjectURL) {
      (window.URL as any).revokeObjectURL = jest.fn();
    }

    mockCreateObjectURL = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    mockRevokeObjectURL = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    // Mock document.body.appendChild and .remove
    mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    mockRemoveChild = jest.spyOn(HTMLElement.prototype, 'remove').mockImplementation(() => {});
  });

  afterEach(() => {
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  const mockAppraisalFormData: AppraisalFormData = {
    requestId: "test-request-123",
    department: "Caldas",
    city: "Manizales",
    address: "Calle 123 #45-67",
    built_area: 80,
    documento_ficha_predial_catastral: true,
    property_type: "Casa",
    estrato: "4",
    pot_restriccion_uso_suelo: { selected: true, description: "Uso residencial permitido según POT." },
    pot_restriccion_edificabilidad: { selected: true, description: "Restricción de edificabilidad por altura máxima." },
    pot_restriccion_altura: { selected: true, description: "Altura máxima permitida de 5 pisos." },
    pot_afectacion_via_publica: { selected: true, description: "Afectación por futura ampliación de vía." },
    pot_afectacion_ronda_hidrica: { selected: true, description: "Afectación por cercanía a quebrada." },
    pot_afectacion_infraestructura_servicios_publicos: { selected: true, description: "Afectación por línea de alta tensión." },
    pot_otra_restriccion_pot: { selected: true, description: "Restricción por plan parcial de desarrollo." },
    zona_declaratoria_especial: {
      aplica: true,
      tipo: "Histórica (Bien de Interés Cultural - BIC)",
      restricciones_comunes: ["Protección del patrimonio arquitectónico"],
      restricciones_comunes_descripcion: "Restricciones de protección del patrimonio arquitectónico, normas de intervención, uso del suelo específico y regulación de publicidad y fachadas por ser BIC.",
      otras_restricciones_seleccion: "Sí, especificar",
      otras_restricciones_descripcion: "Restricciones adicionales por ser zona de desarrollo especial.",
      fuente: "Decreto 123 de 2020",
      declaratoriaImponeObligaciones: true
    },
    gravamenes_cargas_seleccionados: ["hipoteca"],
    gravamenes_cargas_otros: "Otra carga legal: anotación de demanda.",
    litigios_proceso_judicial_seleccionados: ["demanda_propiedad"],
    litigios_proceso_judicial_otros: "Otro litigio: proceso de expropiación por parte del distrito.",
    documento_certificado_tradicion_libertad: true,
    documento_escritura_publica: true,
    documento_recibo_impuesto_predial: true,
    documento_paz_salvo_administracion: true,
    documento_reglamento_ph: true,
    documentos_otros: "Ninguno",
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
      autorizacionTratamientoDatos: true
    },
    expectedValue: 1500000,
    ph_aplica: true,
    ph_sometido_ley_675: true,
    ph_reglamento_interno: true,
    ph_reglamento_cubre_aspectos: true,
    ph_escritura_registrada: true,
    ph_tipo_propiedad: "Residencial",
    ph_nombre_conjunto: "Conjunto Residencial Ejemplo",
    ph_nit_copropiedad: "900123456-7",
    ph_restriccion_arrendamiento: "Ninguna",
    ph_cuotas_pendientes: "No",
    ph_normativa_interna: "Sí",
    impuestoPredialAlDia: true,
    reglamentoPropiedadHorizontalInscrito: true,
    deudasCuotasAdministracion: false,
    pot_otras_restricciones_descripcion: "Detalle de otras restricciones POT.",
    contrato_escrito_vigente: "Sí",
    preferencia_requisito_futuro_contrato: "No",
    responsable_servicios_publicos: "Arrendatario",
    gravamen_hipoteca_description: "Hipoteca con Banco Ejemplo S.A.",
    gravamen_embargo_description: "Embargo por deuda fiscal.",
    gravamen_servidumbre_description: "Servidumbre de tránsito a favor del predio vecino.",
    gravamen_prenda_description: "Prenda sobre bienes muebles del inmueble.",
    gravamen_usufructo_description: "Usufructo vitalicio a favor de Juan Pérez.",
    litigio_demanda_propiedad_description: "Demanda de pertenencia en curso.",
    litigio_proceso_sucesion_description: "Proceso de sucesión intestada pendiente.",
    litigio_disputa_linderos_description: "Disputa de linderos con el predio colindante.",
    litigio_ejecucion_hipotecaria_description: "Proceso de ejecución hipotecaria iniciado por el banco.",
    acceso_servicios_publicos: "Todos",
    serviciosConectadosFuncionando: true,
    deudasServiciosPublicos: false,
    condiciones_seguridad_salubridad: "Buenas condiciones generales.",
    cumpleNormasSismoresistencia: true,
    riesgosEvidentesHabitabilidad: true,
    riesgosEvidentesHabitabilidadDescription: "Humedad en el sótano debido a filtraciones menores.",
    seguros_obligatorios_recomendables: "true",
    cuentaPolizaSeguroVigente: true,
    admin_fee: 200000,
    imagesBase64: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/.....QC0oNFFMBaKKKkBM0tFFACZpKKKACiiikhsWnCiimIWkNFFACZ5ppNFFJjR//Z"],
    materialQualityEntries: []
  };

  // Create a mock payload that matches AppraisalSubmissionPayload
  const mockAppraisalSubmissionPayload: AppraisalSubmissionPayload = {
    requestId: mockAppraisalFormData.requestId!,
    department: mockAppraisalFormData.department,
    city: mockAppraisalFormData.city,
    address: mockAppraisalFormData.address,
    // Omit the fields that are now part of imagesBase64, requestId, department, city, or address
    ...(() => {
      const { imagesBase64, requestId, department, city, address, ...rest } = mockAppraisalFormData;
      return rest;
    })(),
    imagesBase64: mockAppraisalFormData.imagesBase64 || [],
    materialQualityEntries: mockAppraisalFormData.materialQualityEntries || [],
  };

  test('submitAppraisal should send requestId and payload and return successfully on 200', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Appraisal submitted successfully' }), { status: 200 });

    await expect(appraisalApiService.submitAppraisal(mockAppraisalSubmissionPayload.requestId, mockAppraisalSubmissionPayload)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/n8n/recepcion-datos-inmueble',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: mockAppraisalSubmissionPayload.requestId,
          formData: mockAppraisalSubmissionPayload,
        }),
      }
    );
  });

  test('submitAppraisal should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'Submission failed' };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 });

    await expect(appraisalApiService.submitAppraisal(mockAppraisalSubmissionPayload.requestId, mockAppraisalSubmissionPayload)).rejects.toThrow(
      `Error 400: ${JSON.stringify(errorResponse)}`
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/n8n/recepcion-datos-inmueble',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: mockAppraisalSubmissionPayload.requestId,
          formData: mockAppraisalSubmissionPayload,
        }),
      }
    );
  });

  test('submitAppraisal should throw an error on network failure', async () => {
    const networkError = new Error('Network request failed');
    fetchMock.mockRejectOnce(networkError);

    await expect(appraisalApiService.submitAppraisal(mockAppraisalSubmissionPayload.requestId, mockAppraisalSubmissionPayload)).rejects.toThrow(
      networkError.message
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/n8n/recepcion-datos-inmueble',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: mockAppraisalSubmissionPayload.requestId,
          formData: mockAppraisalSubmissionPayload,
        }),
      }
    );
  });

  const mockAppraisalResult: AppraisalResult = {
    request_id: "test-request-123",
    initial_data: {
      ciudad: "Manizales",
      address: "Calle 123 #45-67",
      area_usuario_m2: 80,
      tipo_inmueble: "Casa",
      estrato: "4",
    },
    appraisal_data: {
      analisis_mercado: {
        rango_arriendo_referencias_cop: { min: 1000000, max: 1500000 },
        observacion_mercado: "Mercado estable con demanda creciente.",
      },
      valoracion_arriendo_actual: {
        estimacion_canon_mensual_cop: 1200000,
        justificacion_estimacion_actual: "Basado en comparables y características del inmueble.",
      },
      potencial_valorizacion_con_mejoras_explicado: {
        mejoras_con_impacto_detallado: [],
        canon_potencial_total_estimado_cop: 1800000,
        comentario_estrategia_valorizacion: "Potencial significativo con mejoras en cocina y baños.",
      },
      analisis_legal_arrendamiento: {
        requestId: "test-request-123",
        tipo_uso_principal_analizado: "Residencial",
        viabilidad_general_preliminar: "Viable",
        puntos_criticos_y_riesgos: [],
        documentacion_clave_a_revisar_o_completar: [],
        consideraciones_contractuales_sugeridas: ["Cláusula de mantenimiento", "Duración del contrato"],
        resumen_ejecutivo_legal: "Análisis legal favorable.",
      },
      gemini_usage_metadata: {
        economico: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
          promptTokensDetails: [],
          thoughtsTokenCount: 20,
        },
      },
    },
    user_id: "mock-user-id",
    created_at: "2023-01-01T10:00:00Z",
  };

  test('downloadPdf should download PDF successfully', async () => {
    const mockPdfBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/pdf' }),
        blob: () => Promise.resolve(mockPdfBlob),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      } as Response)
    );

    const mockAppraisalId = 'mock-appraisal-id-123';
    const accessToken = 'mock-access-token';
    await appraisalApiService.downloadPdf(mockAppraisalId, accessToken);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockPdfBlob);
    expect(mockAppendChild).toHaveBeenCalledTimes(1);
    expect(mockRemoveChild).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/appraisal/download-pdf?appraisalId=${mockAppraisalId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
  });

  test('downloadPdf should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'PDF download failed' };

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      } as Response)
    );

    const mockAppraisalId = 'mock-appraisal-id-123';
    const accessToken = 'mock-access-token';
    await expect(appraisalApiService.downloadPdf(mockAppraisalId, accessToken)).rejects.toThrow(
      errorResponse.message
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/appraisal/download-pdf?appraisalId=${mockAppraisalId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
  });

  test('saveAppraisalResult should save appraisal successfully', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Appraisal saved successfully' }),
        text: () => Promise.resolve(JSON.stringify({ message: 'Appraisal saved successfully' })),
      } as Response)
    );

    const userId = 'mock-user-id';
    const accessToken = 'mock-access-token';
    await expect(appraisalApiService.saveAppraisalResult(mockAppraisalFormData, userId, accessToken)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appraisal/save-result',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ appraisalData: mockAppraisalFormData, userId: userId }),
      }
    );
  });

  test('saveAppraisalResult should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'Save failed' };

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      } as Response)
    );

    const userId = 'mock-user-id';
    const accessToken = 'mock-access-token';
    await expect(appraisalApiService.saveAppraisalResult(mockAppraisalFormData, userId, accessToken)).rejects.toThrow(
      errorResponse.message
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appraisal/save-result',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ appraisalData: mockAppraisalFormData, userId: userId }),
      }
    );
  });
});
