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
      console.log('Places data loaded:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching places:', error);
      throw error;
    }
  }
}

export const placesApiService = new PlacesApiService();