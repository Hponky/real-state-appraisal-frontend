interface Department {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(`Error fetching places: ${error}`);
    }
  }
}

export const placesApiService = new PlacesApiService();