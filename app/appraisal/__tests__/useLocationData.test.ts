import { renderHook, act } from '@testing-library/react'; // Removed waitFor as it's not needed with synchronous fetcher
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { placesApiService } from '../../services/placesApi';
import { useLocationData } from '../hooks/useLocationData';

// Mock placesApiService
jest.mock('../../services/placesApi', () => ({
  placesApiService: {
    getPlaces: jest.fn(),
  },
}));

// Mock useSWR to simulate its behavior with a synchronous fetcher
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key, fetcher) => {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      let isMounted = true;
      const fetchData = () => { // No longer async
        setIsLoading(true);
        try {
          const result = fetcher(key); // This calls placesApiService.getPlaces synchronously
          if (isMounted) {
            setData(result);
            setError(undefined);
          }
        } catch (e: any) {
          if (isMounted) {
            setError(e);
            setData(undefined);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchData();
      return () => { isMounted = false; };
    }, [key, fetcher]);

    return { data, error, isLoading };
  }),
}));

const mockPlacesData = [
  { departamento: 'Antioquia', ciudades: ['Medellín', 'Envigado'] },
  { departamento: 'Cundinamarca', ciudades: ['Bogotá', 'Chía'] },
];

describe('useLocationData', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers
    (placesApiService.getPlaces as jest.Mock).mockClear();
    // Mock placesApiService.getPlaces to return data synchronously
    (placesApiService.getPlaces as jest.Mock).mockImplementation(() => mockPlacesData);
    (useSWR as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Flush any remaining timers
    jest.useRealTimers(); // Restore real timers
  });

  it('should fetch places data and return departments and cities', async () => {
    const { result } = renderHook(() => useLocationData('Antioquia'));

    expect(result.current.isLoadingPlaces).toBe(true);
    expect(result.current.departments).toEqual([]);
    expect(result.current.cities).toEqual([]);

    // Act to flush the useEffect and state updates
    act(() => {
      jest.runAllTimers(); // Run all timers to flush useEffect
    });

    // Now, the state should be updated
    expect(placesApiService.getPlaces).toHaveBeenCalledTimes(1); // Should be called once
    expect(result.current.isLoadingPlaces).toBe(false);
    expect(result.current.placesError).toBeNull();
    expect(result.current.departments).toEqual(['Antioquia', 'Cundinamarca']);
    expect(result.current.cities).toEqual(['Medellín', 'Envigado']);
  });

  it('should return empty arrays if placesData is null or undefined', async () => {
    (placesApiService.getPlaces as jest.Mock).mockImplementation(() => null); // Simulate fetcher returning null synchronously

    const { result } = renderHook(() => useLocationData('Antioquia'));

    expect(result.current.isLoadingPlaces).toBe(true);
    expect(result.current.departments).toEqual([]);
    expect(result.current.cities).toEqual([]);

    act(() => {
      jest.runAllTimers(); // Flush updates
    });

    expect(placesApiService.getPlaces).toHaveBeenCalledTimes(1);
    expect(result.current.isLoadingPlaces).toBe(false);
    expect(result.current.departments).toEqual([]);
    expect(result.current.cities).toEqual([]);
  });

  it('should handle SWR error', async () => {
    const mockError = new Error('Failed to fetch');
    (placesApiService.getPlaces as jest.Mock).mockImplementation(() => { throw mockError; }); // Simulate fetcher throwing error synchronously

    const { result } = renderHook(() => useLocationData('Antioquia'));

    expect(result.current.isLoadingPlaces).toBe(true);
    expect(result.current.placesError).toBeNull();

    act(() => {
      jest.runAllTimers(); // Flush updates
    });

    expect(placesApiService.getPlaces).toHaveBeenCalledTimes(1);
    expect(result.current.isLoadingPlaces).toBe(false);
    expect(result.current.placesError).toBe('Error al cargar los datos de ubicación. Intente recargar la página.');
    expect(result.current.departments).toEqual([]);
    expect(result.current.cities).toEqual([]);
  });

  it('should return empty cities if no department is selected', async () => {
    (placesApiService.getPlaces as jest.Mock).mockImplementation(() => mockPlacesData); // Ensure it returns data synchronously

    const { result } = renderHook(() => useLocationData('')); // No department selected

    expect(result.current.isLoadingPlaces).toBe(true); // Still loading initially
    act(() => {
      jest.runAllTimers(); // Flush updates
    });

    expect(placesApiService.getPlaces).toHaveBeenCalledTimes(1);
    expect(result.current.cities).toEqual([]);
  });

  it('should return empty cities if selected department has no cities', async () => {
    (placesApiService.getPlaces as jest.Mock).mockImplementation(() => [{ departamento: 'Vaupés', ciudades: [] }]); // Synchronous return

    const { result } = renderHook(() => useLocationData('Vaupés'));

    expect(result.current.isLoadingPlaces).toBe(true); // Still loading initially
    act(() => {
      jest.runAllTimers(); // Flush updates
    });

    expect(placesApiService.getPlaces).toHaveBeenCalledTimes(1);
    expect(result.current.cities).toEqual([]);
  });
});
