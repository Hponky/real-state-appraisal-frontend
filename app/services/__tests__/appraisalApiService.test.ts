import fetchMock from 'jest-fetch-mock';
import { appraisalApiService } from '../appraisalApiService';
import { FormDataAppraisalResult } from '../../appraisal/types/appraisal-results';

fetchMock.enableMocks();

describe('appraisalApiService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  const mockFormDataAppraisalResult: FormDataAppraisalResult = {
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
    seguros_obligatorios_recomendables: true,
    cuentaPolizaSeguroVigente: true,
    admin_fee: 200000,
    imagesBase64: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/.....QC0oNFFMBaKKKkBM0tFFACZpKKKACiiikhsWnCiimIWkNFFACZ5ppNFFJjR//Z"],
    materialQualityEntries: []
  };

  const mockN8nWebhookRequestBody = {
    requestId: "test-request-123",
    formData: mockFormDataAppraisalResult,
  };

  test('submitAppraisal should send requestId and formData and return successfully on 200', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Appraisal submitted successfully' }), { status: 200 });

    await expect(appraisalApiService.submitAppraisal(mockN8nWebhookRequestBody.requestId, mockN8nWebhookRequestBody.formData)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/n8n/recepcion-datos-inmueble',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockN8nWebhookRequestBody),
      }
    );
  });

  test('submitAppraisal should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'Submission failed' };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 400 });

    await expect(appraisalApiService.submitAppraisal(mockN8nWebhookRequestBody.requestId, mockN8nWebhookRequestBody.formData)).rejects.toThrow(
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
        body: JSON.stringify(mockN8nWebhookRequestBody),
      }
    );
  });

  test('submitAppraisal should throw an error on network failure', async () => {
    const networkError = new Error('Network request failed');
    fetchMock.mockRejectOnce(networkError);

    await expect(appraisalApiService.submitAppraisal(mockN8nWebhookRequestBody.requestId, mockN8nWebhookRequestBody.formData)).rejects.toThrow(
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
        body: JSON.stringify(mockN8nWebhookRequestBody),
      }
    );
  });

  test('downloadPdf should download PDF successfully', async () => {
    fetchMock.disableMocks(); // Temporarily disable fetchMock for this test

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

    const accessToken = 'mock-access-token';
    const result = await appraisalApiService.downloadPdf(mockN8nWebhookRequestBody.formData, accessToken);

    expect(result).toEqual(mockPdfBlob);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appraisal/download-pdf',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(mockN8nWebhookRequestBody.formData),
      }
    );
    fetchMock.enableMocks(); // Re-enable fetchMock after this test
  });

  test('downloadPdf should throw an error on non-200 response', async () => {
    fetchMock.disableMocks(); // Temporarily disable fetchMock for this test

    const errorResponse = { message: 'PDF download failed' };

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse), // Mock json() method
        text: () => Promise.resolve(JSON.stringify(errorResponse)), // Mock text() method
      } as Response)
    );

    const accessToken = 'mock-access-token';
    await expect(appraisalApiService.downloadPdf(mockN8nWebhookRequestBody.formData, accessToken)).rejects.toThrow(
      errorResponse.message
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appraisal/download-pdf',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(mockN8nWebhookRequestBody.formData),
      }
    );
    fetchMock.enableMocks(); // Re-enable fetchMock after this test
  });

  test('saveAppraisalResult should save appraisal successfully', async () => {
    fetchMock.disableMocks(); // Temporarily disable fetchMock for this test

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
    await expect(appraisalApiService.saveAppraisalResult(mockN8nWebhookRequestBody.formData, userId, accessToken)).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appraisal/save-result',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ appraisalData: mockN8nWebhookRequestBody.formData, userId: userId }),
      }
    );
    fetchMock.enableMocks(); // Re-enable fetchMock after this test
  });

  test('saveAppraisalResult should throw an error on non-200 response', async () => {
    fetchMock.disableMocks(); // Temporarily disable fetchMock for this test

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
    await expect(appraisalApiService.saveAppraisalResult(mockN8nWebhookRequestBody.formData, userId, accessToken)).rejects.toThrow(
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
        body: JSON.stringify({ appraisalData: mockN8nWebhookRequestBody.formData, userId: userId }),
      }
    );
    fetchMock.enableMocks(); // Re-enable fetchMock after this test
  });
});
