import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { placesApiService } from "../services/placesApi";
import { useImageHandler } from "./useImageHandler";
import { useMaterialQualityEntries } from "./useMaterialQualityEntries"; // MaterialQualityEntry is not used directly here
import { appraisalFormSchema, AppraisalFormData } from "./appraisalFormSchema"; // Import the schema and type
import { useAppraisalSubmission } from "./useAppraisalSubmission"; // Import the new submission hook

export function useAppraisalForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<AppraisalFormData>({
    department: "",
    city: "",
    address: "",
    area: null,
    stratum: "",
    adminFee: null,
    expectedValue: 0,
    propertyType: "",
    materialQualityEntries: [],
  });

  // Helper to handle numeric inputs
  const handleNumericChange = useCallback((field: keyof AppraisalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : Number(value)
    }));
  }, []);
  // const [images, setImages] = useState<string[]>([]); // Removed: Handled by useImageHandler
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [apiError, setApiError] = useState<string | null>(null); // Removed: Handled by SWR

  // --- SWR Fetching for Places Data ---
  const SWR_PLACES_KEY = 'colombia-places';
  const { data: placesData, error: placesErrorSWR, isLoading: isLoadingPlaces } = useSWR(
      SWR_PLACES_KEY,
      () => placesApiService.getPlaces(),
      {
          // Optional: Configuration like revalidation settings
          revalidateOnFocus: false, // Example: disable revalidation on window focus
          // onErrorRetry: (error, key, config, revalidate, { retryCount }) => { ... } // Custom error handling
      }
  );

  // --- Image Handling Hook ---
  const {
    images, // Preview URLs
    imageFiles, // File objects
    imageErrors,
    handleImageUpload,
    removeImage,
    clearImageErrors,
  } = useImageHandler();

  // --- Material Quality Hook ---
  const {
      materialQualityEntries,
      addMaterialQualityEntry,
      removeMaterialQualityEntry,
      updateMaterialQualityEntry,
  } = useMaterialQualityEntries(setErrors); // Pass setErrors to the hook
  // --- End Hook ---

  // --- Derived State from SWR Data ---
  const departments = useMemo(() => {
      if (!placesData) return [];
      // Ensure data is an array before mapping
      return Array.isArray(placesData)
          ? Array.from(new Set(placesData.map(place => place.departamento)))
          : [];
  }, [placesData]);

  const cities = useMemo(() => {
      if (!placesData || !formData.department || !Array.isArray(placesData)) return [];
      const selectedDepartmentData = placesData.find(
          place => place.departamento === formData.department
      );
      return selectedDepartmentData ? Array.from(new Set(selectedDepartmentData.ciudades)) : [];
  }, [placesData, formData.department]);

  // --- User-friendly error message from SWR error ---
  const placesError = useMemo(() => {
      if (!placesErrorSWR) return null;
      console.error('SWR fetching error:', placesErrorSWR);
      // Provide a generic error message, or inspect placesErrorSWR for more details if needed
      return 'Error al cargar los datos de ubicación. Intente recargar la página.';
  }, [placesErrorSWR]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Submission Hook ---
  const { submitFormData } = useAppraisalSubmission({
      formData,
      imageFiles,
      materialQualityEntries,
      setErrors,
      clearImageErrors,
      setIsSubmitting,
  });
  // --- End Submission Hook ---

  // Wrap validateForm in useCallback to prevent unnecessary re-renders if passed as prop
  const validateForm = useCallback(() => {
    // Combine formData with materialQualityEntries for Zod validation
    const dataToValidate = {
        ...formData,
        materialQualityEntries: materialQualityEntries.filter(
            // Only include entries that have at least one field filled for validation
            entry => entry.location.trim() !== '' || entry.qualityDescription.trim() !== ''
        ),
    };

    const result = appraisalFormSchema.safeParse(dataToValidate);

    const newErrors: Record<string, string> = {};

    if (!result.success) {
      // Process Zod errors
      result.error.errors.forEach(err => {
        // Zod error paths are arrays, e.g., ['materialQualityEntries', 0, 'location']
        const path = err.path.join('_'); // Convert path array to string key
        newErrors[path] = err.message;
      });
    }

    // Handle image validation separately and merge errors
    if (imageFiles.length === 0) {
        newErrors.images = "Cargue al menos una imagen";
    } else if (imageFiles.length > 30) {
        newErrors.images = "Puede cargar un máximo de 30 imágenes";
    }

    // Include image errors from the hook if they exist
    if (imageErrors) {
        newErrors.images = imageErrors;
    }

    // Update the errors state
    setErrors(newErrors);

    // Return true if validation is successful (no Zod errors and no image errors)
    return result.success && Object.keys(newErrors).length === 0;

  }, [formData, materialQualityEntries, imageFiles.length, imageErrors, setErrors]); // Updated dependencies

  // Combine errors explicitly to help TypeScript inference
  const combinedErrors: Record<string, string> = { ...errors };
  if (imageErrors) {
    combinedErrors.images = imageErrors;
  }

  return {
    formData,
    setFormData,
    images, // Preview URLs from useImageHandler
    imageFiles, // File objects from useImageHandler
    errors: combinedErrors, // Use the explicitly typed combined errors object
    isSubmitting,
    handleImageUpload, // From useImageHandler
    removeImage, // From useImageHandler
    submitFormData, // Export the new submission function
    departments, // Derived from SWR
    cities, // Derived from SWR
    isLoadingPlaces, // SWR loading state
    placesError, // SWR error state (user-friendly message)
    materialQualityEntries, // From useMaterialQualityEntries
    addMaterialQualityEntry, // From useMaterialQualityEntries
    removeMaterialQualityEntry, // From useMaterialQualityEntries
    updateMaterialQualityEntry, // From useMaterialQualityEntries
    handleNumericChange // Add the numeric change handler
  };
}