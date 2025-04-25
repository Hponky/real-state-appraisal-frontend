export interface Department {
  id: number;
  departamento: string;
  ciudades: string[];
}

interface IPlacesApiService {
  getPlaces(): Promise<Department[]>;
}

class PlacesApiService implements IPlacesApiService {
  private readonly baseUrl: string = 'https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.min.json';

  async getPlaces(): Promise<Department[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        let errorBody = '';
        try {
          // Attempt to read the error body for more details
          errorBody = await response.text();
        } catch (e) {
          // Ignore if reading body fails
        }
        throw new Error(`HTTP error! status: ${response.status}${errorBody ? ` - ${errorBody}` : ''}`);
      }

      const data = await response.json();

      // Validate the structure of the received data
      if (!Array.isArray(data) || !data.every((item: any) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.departamento === 'string' &&
        Array.isArray(item.ciudades) &&
        item.ciudades.every((city: any) => typeof city === 'string')
      )) {
        throw new Error('Unexpected data structure received from API');
      }

      // The API response structure seems to be an array of objects with 'departamento' and 'ciudades'.
      // We need to map this to the Department interface which expects 'id'.
      // Assuming the original API (datos.gov.co) had an 'id' field, but the githubusercontent.com
      // version might not. Let's generate a simple ID for consistency with the interface.
      // If the original API is indeed different, this mapping might need adjustment.
      const departmentsWithIds: Department[] = data.map((item: any, index: number) => ({
          id: index + 1, // Generate a simple sequential ID
          departamento: item.departamento,
          ciudades: item.ciudades,
      }));


      return departmentsWithIds;

    } catch (error) {
      // More robust error message construction
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error fetching places: ${errorMessage}`);
    }
  }
}

export const placesApiService = new PlacesApiService();