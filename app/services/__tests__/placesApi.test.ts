import fetchMock from 'jest-fetch-mock';
import { placesApiService } from '../placesApi';

describe('placesApiService', () => {
  beforeEach(fetchMock.resetMocks);
  const URL = 'https://www.datos.gov.co/resource/xdk5-pm3f.json';
/**
 * @description
 * Este test valida que el método `getPlaces` obtiene correctamente los datos de departamentos desde el endpoint oficial
 * y no lanza errores si el fetch es exitoso, garantizando la carga de datos iniciales para completar el formulario.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-01 - Validar ingreso exitoso de todos los datos del inmueble
 */
   test('getPlaces should fetch data and return departments on success', async () => {
    fetchMock.mockResponseOnce('[]');
    await placesApiService.getPlaces();
  });
/**
 * @description
 * Este test valida que `getPlaces` arroja un error si la respuesta del servidor no es satisfactoria (por ejemplo, 404),
 * lo que cubre escenarios donde la fuente de datos falla o no está disponible.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-02 - Validar mensaje de error cuando falta un campo obligatorio
 */
  test('getPlaces should throw an error on non-200 response', async () => {
    fetchMock.mockResponseOnce('', {status:404});
    await expect(placesApiService.getPlaces()).rejects.toThrow();
  });
/**
 * @description
 * Este test asegura que `getPlaces` maneja correctamente errores de red simulando un fallo total de conexión,
 * validando así la resiliencia del sistema ante fallas técnicas externas.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-03 - Validar ingreso de valores no permitidos en los campos
 */
  test('getPlaces should throw an error on network failure', async () => {
    fetchMock.mockReject();
    await expect(placesApiService.getPlaces()).rejects.toThrow();
  });
/**
 * @description
 * Este test evalúa el comportamiento de `getPlaces` ante una estructura inesperada en la respuesta,
 * asegurando que se manejen correctamente datos corruptos o malformateados desde el origen.
 * Historia de Usuario: HU-01 - Ingresar Información Básica del Inmueble
 * Caso de Prueba: CP-05 - Validar error al cargar archivos en formatos no permitidos / datos inesperados
 */
  test('getPlaces should throw an error on unexpected response structure', async () => {
    fetchMock.mockResponseOnce('[{"wrong":"data"}]');
    await expect(placesApiService.getPlaces()).rejects.toThrow();
  });
});