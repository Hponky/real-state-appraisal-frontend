import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react"; // Import Dispatch, SetStateAction

// Define the structure for each material quality entry
export interface MaterialQualityEntry {
  id: string; // Unique ID for React key and removal logic
  location: string;
  qualityDescription: string;
}

// Helper to generate unique IDs consistently on the client
let materialEntryCounter = 0;
const generateMaterialEntryId = () => `material-entry-${Date.now()}-${materialEntryCounter++}`;

export interface MaterialQualityHandlerResult {
  materialQualityEntries: MaterialQualityEntry[];
  addMaterialQualityEntry: () => void;
  removeMaterialQualityEntry: (id: string) => void;
  updateMaterialQualityEntry: (id: string, field: keyof Omit<MaterialQualityEntry, 'id'>, value: string) => void;
  // Removed error state and setters from here, will be managed by parent
}

// Accept setErrors from the parent hook
export function useMaterialQualityEntries(
    setErrors: Dispatch<SetStateAction<Record<string, string>>>
): MaterialQualityHandlerResult {
  // Initialize as empty array to avoid hydration mismatch
  const [materialQualityEntries, setMaterialQualityEntries] = useState<MaterialQualityEntry[]>([]);
  // Removed internal error state: const [materialQualityErrors, setMaterialQualityErrors] = useState<Record<string, string>>({});

  // Effect to add initial entry only on client-side
  useEffect(() => {
    // Add the first entry only if the list is currently empty (runs after initial mount)
    if (materialQualityEntries.length === 0) {
      setMaterialQualityEntries([{ id: generateMaterialEntryId(), location: '', qualityDescription: '' }]);
    }
    // Intentionally run only once on mount by checking length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once after mount

  const addMaterialQualityEntry = useCallback(() => {
    setMaterialQualityEntries(prev => [
      ...prev,
      // Use the client-side safe ID generator
      { id: generateMaterialEntryId(), location: '', qualityDescription: '' }
    ]);
  }, []);

  const removeMaterialQualityEntry = useCallback((id: string) => {
    // Prevent removing the last entry
    if (materialQualityEntries.length <= 1) return;
    setMaterialQualityEntries(prev => prev.filter(entry => entry.id !== id));
    // Clear errors in the parent state when removing an entry
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`material_${id}_location`];
        delete newErrors[`material_${id}_qualityDescription`];
        return newErrors;
    });
  }, [materialQualityEntries.length, setErrors]); // Add setErrors dependency

  const updateMaterialQualityEntry = useCallback((id: string, field: keyof Omit<MaterialQualityEntry, 'id'>, value: string) => {
    setMaterialQualityEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
     // Clear specific errors in the parent state when updating a field
     setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`material_${id}_location`];
        delete newErrors[`material_${id}_qualityDescription`];
        return newErrors;
      });
  }, [setErrors]); // Add setErrors dependency

  // Removed clearMaterialQualityErrors as errors are cleared directly via setErrors


  return {
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry,
    // Removed error state and setters from return object
  };
}