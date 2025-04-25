import fetchMock from 'jest-fetch-mock';
import { placesApiService } from '../placesApi';

describe('placesApiService', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('getPlaces should fetch data and return departments on success', async () => {
    const mockDepartments = [
      { id: 1, departamento: 'Dept1', ciudades: ['CityA', 'CityB'] },
      { id: 2, departamento: 'Dept2', ciudades: ['CityC'] },
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockDepartments), { status: 200 });

    const result = await placesApiService.getPlaces();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.datos.gov.co/resource/xdk5-pm3f.json', // Assuming this is the correct endpoint
      {
        method: 'GET',
      }
    );
    expect(result).toEqual(mockDepartments);
  });

  test('getPlaces should throw an error on non-200 response', async () => {
    const errorResponse = { message: 'Failed to fetch places' };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), { status: 404 });

    await expect(placesApiService.getPlaces()).rejects.toThrow(
      `Error fetching places: ${JSON.stringify(errorResponse)}`
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.datos.gov.co/resource/xdk5-pm3f.json', // Assuming this is the correct endpoint
      {
        method: 'GET',
      }
    );
  });

  test('getPlaces should throw an error on network failure', async () => {
    const networkError = new Error('Network request failed');
    fetchMock.mockRejectOnce(networkError);

    await expect(placesApiService.getPlaces()).rejects.toThrow(
      `Error fetching places: ${networkError.message}`
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.datos.gov.co/resource/xdk5-pm3f.json', // Assuming this is the correct endpoint
      {
        method: 'GET',
      }
    );
  });

  test('getPlaces should throw an error on unexpected response structure', async () => {
    const unexpectedResponse = [{ some_other_field: 'data' }]; // Unexpected structure
    fetchMock.mockResponseOnce(JSON.stringify(unexpectedResponse), { status: 200 });

    await expect(placesApiService.getPlaces()).rejects.toThrow(
      'Error fetching places: Unexpected data structure received from API'
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.datos.gov.co/resource/xdk5-pm3f.json',
      {
        method: 'GET',
      }
    );
  });
});