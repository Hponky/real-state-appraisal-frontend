import { useMemo } from 'react';
import useSWR from 'swr';
import { placesApiService } from '../../services/placesApi';

interface PlaceData {
  departamento: string;
  ciudades: string[];
}

export function useLocationData(selectedDepartment: string) {
  const SWR_PLACES_KEY = 'colombia-places';
  const { data: placesData, error: placesErrorSWR, isLoading: isLoadingPlaces } = useSWR<PlaceData[]>(
    SWR_PLACES_KEY,
    () => placesApiService.getPlaces(),
    {
      revalidateOnFocus: false,
    }
  );

  const departments = useMemo(() => {
    if (!placesData) return [];
    return Array.isArray(placesData)
      ? Array.from(new Set(placesData.map(place => place.departamento)))
      : [];
  }, [placesData]);

  const cities = useMemo(() => {
    if (!placesData || !selectedDepartment || !Array.isArray(placesData)) return [];
    const selectedDepartmentData = placesData.find(
      place => place.departamento === selectedDepartment
    );
    return selectedDepartmentData ? Array.from(new Set(selectedDepartmentData.ciudades)) : [];
  }, [placesData, selectedDepartment]);

  const placesError = useMemo(() => {
    if (!placesErrorSWR) return null;
    console.error('SWR fetching error:', placesErrorSWR);
    return 'Error al cargar los datos de ubicación. Intente recargar la página.';
  }, [placesErrorSWR]);

  return {
    departments,
    cities,
    isLoadingPlaces,
    placesError,
  };
}