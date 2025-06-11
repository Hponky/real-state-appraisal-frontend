/// <reference types="jest" />
import { renderHook, act } from '@testing-library/react';
import { useMaterialQualityEntries } from '../hooks/useMaterialQualityEntries';

describe('useMaterialQualityEntries', () => {
  const mockSetErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with one empty entry', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    expect(result.current.materialQualityEntries).toHaveLength(1);
    expect(result.current.materialQualityEntries[0].location).toBe('');
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe('');
    expect(result.current.materialQualityEntries[0].id).toBeDefined();
  });

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
    expect(newEntry.id).not.toBe(result.current.materialQualityEntries[0].id); // Ensure unique ID
  });

  test('should remove an entry by id', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    act(() => {
      result.current.addMaterialQualityEntry(); // Add a second entry
    });
    const initialEntries = result.current.materialQualityEntries;
    expect(initialEntries).toHaveLength(2);

    const idToRemove = initialEntries[0].id;

    act(() => {
      result.current.removeMaterialQualityEntry(idToRemove);
    });

    expect(result.current.materialQualityEntries).toHaveLength(1);
    expect(result.current.materialQualityEntries.find(entry => entry.id === idToRemove)).toBeUndefined();
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Should clear errors related to the removed entry
  });

  test('should not remove the last entry', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialEntries = result.current.materialQualityEntries;
    expect(initialEntries).toHaveLength(1);

    const idToRemove = initialEntries[0].id;

    act(() => {
      result.current.removeMaterialQualityEntry(idToRemove);
    });

    expect(result.current.materialQualityEntries).toHaveLength(1); // Should still have 1 entry
    expect(result.current.materialQualityEntries[0].id).toBe(idToRemove); // The same entry should remain
    expect(mockSetErrors).not.toHaveBeenCalled(); // Should not clear errors if removal was prevented
  });

  test('should update an entry field by id', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialEntryId = result.current.materialQualityEntries[0].id;
    const newLocation = 'Living Room';
    const newDescription = 'Recently renovated';

    act(() => {
      result.current.updateMaterialQualityEntry(initialEntryId, 'location', newLocation);
    });

    expect(result.current.materialQualityEntries[0].location).toBe(newLocation);
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe(''); // Other field should be unchanged
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Should clear errors related to the updated entry

    act(() => {
      result.current.updateMaterialQualityEntry(initialEntryId, 'qualityDescription', newDescription);
    });

    expect(result.current.materialQualityEntries[0].location).toBe(newLocation); // Other field should be unchanged
    expect(result.current.materialQualityEntries[0].qualityDescription).toBe(newDescription);
    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function)); // Should clear errors related to the updated entry
  });

  test('should not update if id is not found', () => {
    const { result } = renderHook(() => useMaterialQualityEntries(mockSetErrors));
    const initialEntries = result.current.materialQualityEntries;
    expect(initialEntries).toHaveLength(1);

    const nonExistentId = 'non-existent-id';
    const newLocation = 'Should not change';

    act(() => {
      result.current.updateMaterialQualityEntry(nonExistentId, 'location', newLocation);
    });

    expect(result.current.materialQualityEntries).toEqual(initialEntries); // Entries should be unchanged
    expect(mockSetErrors).not.toHaveBeenCalled(); // Should not clear errors if no entry was updated
  });
});
