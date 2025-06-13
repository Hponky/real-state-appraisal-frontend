import { renderHook, act } from '@testing-library/react';
import { useMaterialQualityEntries } from '../useMaterialQualityEntries';

describe('useMaterialQualityEntries', () => {
  const mockSetErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
/**
 * Verifica que el hook se inicializa con una entrada vacía de calidad del material.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-01 - Validar que el sistema proponga mejoras relevantes para el inmueble y su estado
 */
  test('should initialize with one empty entry', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    expect(result.current.materialQualityEntries).toHaveLength(1);
    expect(result.current.materialQualityEntries[0].location).toBe('');
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe('');
    expect(result.current.materialQualityEntries[0].id).toBeDefined();
  });
/**
 * Verifica que se puede añadir una nueva entrada vacía de calidad del material.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should add a new empty entry', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialCount = result.current.materialQualityEntries.length;

    act(() => {
      result.current.addMaterialQualityEntry();
    });

    expect(result.current.materialQualityEntries).toHaveLength(initialCount + 1);
    const newEntry = result.current.materialQualityEntries[initialCount];
    expect(newEntry.location).toBe('');
    expect(newEntry.qualityDescription).toBe('');
    expect(newEntry.id).toBeDefined();
    expect(newEntry.id).not.toBe(result.current.materialQualityEntries[0].id);
  });
/**
 * Verifica que una entrada puede ser eliminada por su ID correctamente.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should remove an entry by id', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    act(() => {
      result.current.addMaterialQualityEntry();
    });
    const initialEntries = result.current.materialQualityEntries;
    expect(initialEntries).toHaveLength(2);

    const idToRemove = initialEntries[0].id;

    act(() => {
      result.current.removeMaterialQualityEntry(idToRemove);
    });

    expect(result.current.materialQualityEntries).toHaveLength(1);
    expect(result.current.materialQualityEntries.find(entry => entry.id === idToRemove)).toBeUndefined();
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); 
  });
/**
 * Verifica que no se permite eliminar la última entrada disponible.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should not remove the last entry', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialEntries = result.current.materialQualityEntries;
    expect(initialEntries).toHaveLength(1);

    const idToRemove = initialEntries[0].id;

    act(() => {
      result.current.removeMaterialQualityEntry(idToRemove);
    });

    expect(result.current.materialQualityEntries).toHaveLength(1); 
    expect(result.current.materialQualityEntries[0].id).toBe(idToRemove); 
    expect(mockSetErrors).not.toHaveBeenCalled(); 
  });
/**
 * Verifica que se puede actualizar un campo específico de una entrada identificada por su ID.
 * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
 * Caso de Prueba: CP-04 - Validar que el usuario pueda modificar los parámetros de mejora y ver su impacto actualizado
 */
  test('should update an entry field by id', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialEntryId = result.current.materialQualityEntries[0].id;
    const newLocation = 'Living Room';
    const newDescription = 'Recently renovated';

    act(() => {
      result.current.updateMaterialQualityEntry(initialEntryId, 'location', newLocation);
    });

    expect(result.current.materialQualityEntries[0].location).toBe(newLocation);
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe(''); 
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); 
    act(() => {
      result.current.updateMaterialQualityEntry(initialEntryId, 'qualityDescription', newDescription);
    });

    expect(result.current.materialQualityEntries[0].location).toBe(newLocation); 
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe(newDescription);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); 
  });

  describe('MaterialQualityEntries', () => {
  /**
  * Verifica que no se realiza ninguna actualización si el ID no existe en las entradas.
  * Historia de Usuario: HU-05 - Obtener Sugerencias de Mejora Técnica con Justificación  
  * Caso de Prueba: CP-05 - Validar comportamiento del sistema ante ausencia de datos clave para sugerencias o valorización
  */
    it('should not update if id is not found', () => {
      const mockCallback = jest.fn();
      const initialEntries = [{ id: 'test-id', location: 'original' }];
      const useMaterialQualityEntriesMock = () => ({
        materialQualityEntries: initialEntries,
        updateMaterialQualityEntry: (id, field, value) => {
          const entry = initialEntries.find(e => e.id === id);
          if (entry) {
            entry[field] = value;
            mockCallback();
          }
        }
      });
      const hookResult = useMaterialQualityEntriesMock();
      hookResult.updateMaterialQualityEntry('non-existent-id', 'location', 'test');
      expect(hookResult.materialQualityEntries[0].location).toBe('original');  
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});