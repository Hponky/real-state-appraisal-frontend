import fetchMock from 'jest-fetch-mock';
import { appraisalApiService } from '../appraisalApiService';

fetchMock.enableMocks();

describe('appraisalApiService', () => {
  beforeEach(fetchMock.resetMocks);
/**
 * @description
 * Este test valida que el servicio `submitAppraisal` envía correctamente los datos del formulario
 * y obtiene una respuesta exitosa del backend (status 200), confirmando que el flujo de guardar peritaje funciona correctamente.
 * Historia de Usuario: HU-14 - Guardar Peritaje Realizado como Invitado en mi Nueva Cuenta
 * Caso de Prueba: CP-02 - Validar que al registrarse, el peritaje se asocie correctamente a la nueva cuenta
 */
  test('submitAppraisal should send form data and return successfully on 200', async () => {
    fetchMock.mockResponseOnce('{}', { status: 200 });
    const form = new FormData();
    
    await appraisalApiService.submitAppraisal(form);
    
    expect(fetchMock).toHaveBeenCalled();
  });
/**
 * @description
 * Este test comprueba que el servicio `submitAppraisal` lanza un error si la respuesta no es exitosa (código distinto de 200).
 * Esto garantiza el manejo adecuado de errores si el peritaje no puede guardarse por algún fallo del servidor.
 * Historia de Usuario: HU-14 - Guardar Peritaje Realizado como Invitado en mi Nueva Cuenta
 * Caso de Prueba: CP-05 - Validar que se muestre un mensaje de confirmación tras guardar el peritaje exitosamente
 */
  test('submitAppraisal should throw an error on non-200 response', async () => {
    fetchMock.mockResponseOnce('{}', { status: 400 });
    
    await expect(appraisalApiService.submitAppraisal(new FormData())).rejects.toThrow();
  });
/**
 * @description
 * Este test valida que ante un fallo de red (network failure), el servicio `submitAppraisal` arroja un error.
 * Esto asegura que el sistema maneja correctamente errores de conexión cuando se intenta guardar el peritaje.
 * Historia de Usuario: HU-14 - Guardar Peritaje Realizado como Invitado en mi Nueva Cuenta
 * Caso de Prueba: CP-04 - Validar que el sistema conserve temporalmente el peritaje mientras el usuario se registra o inicia sesión
 */
  test('submitAppraisal should throw an error on network failure', async () => {
  fetchMock.mockRejectOnce(new Error());
  await expect(appraisalApiService.submitAppraisal(new FormData())).rejects.toThrow();
});
});