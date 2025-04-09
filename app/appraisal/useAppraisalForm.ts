import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { placesApiService } from "../services/placesApi";

export interface FormData {
  department: string;
  city: string;
  address: string;
  area: string;
  stratum: string;
  adminFee: string;
  expectedValue: string;
}

// Define the structure for each material quality entry
export interface MaterialQualityEntry {
  id: string; // Unique ID for React key and removal logic
  location: string;
  qualityDescription: string;
}

// Helper to generate unique IDs consistently on the client
let materialEntryCounter = 0;
const generateMaterialEntryId = () => `material-entry-${Date.now()}-${materialEntryCounter++}`;


export function useAppraisalForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    department: "",
    city: "",
    address: "",
    area: "",
    stratum: "",
    adminFee: "",
    expectedValue: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // --- State for Material Quality ---
  // Initialize as empty array to avoid hydration mismatch
  const [materialQualityEntries, setMaterialQualityEntries] = useState<MaterialQualityEntry[]>([]);
  // --- End State ---

  // --- Effect to add initial entry only on client-side ---
  useEffect(() => {
    // Add the first entry only if the list is currently empty (runs after initial mount)
    if (materialQualityEntries.length === 0) {
      setMaterialQualityEntries([{ id: generateMaterialEntryId(), location: '', qualityDescription: '' }]);
    }
    // Intentionally run only once on mount by checking length, or use empty dependency array if preferred
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once after mount

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const placesData = await placesApiService.getPlaces();
        if (Array.isArray(placesData)) {
          const departmentNames = Array.from(new Set(placesData.map(place => place.departamento)));
          console.log('Available departments:', departmentNames);
          setDepartments(departmentNames);
          setApiError(null);
        } else {
           throw new Error("Invalid data format received for places");
        }
      } catch (error) {
        console.error('Error fetching places:', error);
        setApiError('Error al cargar los datos de ubicación - Intente recargar la página');
        setDepartments([]);
      }
    };
    console.log('Fetching places data...');
    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.department) {
        try {
          const placesData = await placesApiService.getPlaces();
          if (!Array.isArray(placesData)) {
             throw new Error("Invalid data format received for places");
          }
          const selectedDepartmentData = placesData.find(
            place => place.departamento === formData.department
          );
          const uniqueCities = selectedDepartmentData ? Array.from(new Set(selectedDepartmentData.ciudades)) : [];
          setCities(uniqueCities);
        } catch (error) {
          console.error('Error fetching cities for department:', formData.department, error);
          setApiError('Error al cargar las ciudades - Intente seleccionar el departamento de nuevo');
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.department]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImageCount = images.length;
      const allowedNewFiles = 10 - currentImageCount;
      if (allowedNewFiles <= 0) {
        setErrors(prev => ({ ...prev, images: "Ya ha alcanzado el límite de 10 imágenes." }));
        return;
      }

      const fileArray = Array.from(files).slice(0, allowedNewFiles);
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));

      setImages(prev => [...prev, ...newImageUrls]);
      setImageFiles(prev => [...prev, ...fileArray]);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });
  };

  // --- Functions for Material Quality ---
  const addMaterialQualityEntry = () => {
    setMaterialQualityEntries(prev => [
      ...prev,
      // Use the client-side safe ID generator
      { id: generateMaterialEntryId(), location: '', qualityDescription: '' }
    ]);
  };

  const removeMaterialQualityEntry = (id: string) => {
    // Prevent removing the last entry if the useEffect ensures there's always at least one after mount
    if (materialQualityEntries.length <= 1) return;
    setMaterialQualityEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateMaterialQualityEntry = (id: string, field: keyof Omit<MaterialQualityEntry, 'id'>, value: string) => {
    setMaterialQualityEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
     // Clear specific errors when updating
     setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`material_${id}_location`];
        delete newErrors[`material_${id}_qualityDescription`];
        return newErrors;
      });
  };
  // --- End Functions ---


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.submit;
        return newErrors;
      });

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('departamento', formData.department);
      formDataToSend.append('ciudad', formData.city);
      formDataToSend.append('direccion', formData.address);
      formDataToSend.append('area', formData.area || '0');
      formDataToSend.append('estrato', formData.stratum);
      formDataToSend.append('administracion', formData.adminFee || '0');
      formDataToSend.append('valor_esperado', formData.expectedValue);

      const validEntries = materialQualityEntries.filter(
        entry => entry.location.trim() !== '' || entry.qualityDescription.trim() !== ''
      );
      if (validEntries.length > 0) {
          formDataToSend.append('material_quality_details', JSON.stringify(validEntries));
      }

      const base64Images = await Promise.all(
        imageFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(new Error(`Error reading file ${file.name}: ${error}`));
            reader.readAsDataURL(file);
          });
        })
      );

      base64Images.forEach((base64, index) => {
        formDataToSend.append(`imagen_base64_${index}`, base64);
      });

      const response = await fetch('http://localhost:5678/webhook-test/recepcion-datos-inmueble', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        let errorData = 'Unknown server error';
        try {
            const jsonError = await response.json();
            errorData = jsonError.message || JSON.stringify(jsonError);
        } catch (parseError) {
            errorData = await response.text();
        }
        console.error("Server response error:", response.status, errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      images.forEach(url => URL.revokeObjectURL(url));
      router.push("/appraisal/results");

    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors(prev => ({ ...prev, submit: `Error al enviar el formulario. ${error instanceof Error ? error.message : 'Por favor, intente de nuevo.'}` }));
    } finally {
      setIsSubmitting(false);
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.department) newErrors.department = "Seleccione un departamento";
    if (!formData.city) newErrors.city = "Seleccione una ciudad";
    if (!formData.address.trim()) newErrors.address = "Ingrese una dirección válida";
    if (!formData.stratum) newErrors.stratum = "Seleccione un estrato";

    if (!formData.expectedValue) {
        newErrors.expectedValue = "Ingrese el valor esperado";
    } else if (isNaN(Number(formData.expectedValue)) || Number(formData.expectedValue) <= 0) {
        newErrors.expectedValue = "Ingrese un valor numérico positivo para el valor esperado";
    }

    if (formData.area && (isNaN(Number(formData.area)) || Number(formData.area) <= 0)) {
        newErrors.area = "Ingrese un área numérica positiva";
    }

    if (formData.adminFee && (isNaN(Number(formData.adminFee)) || Number(formData.adminFee) < 0)) {
        newErrors.adminFee = "Ingrese una administración numérica no negativa";
    }

    if (images.length === 0) {
        newErrors.images = "Cargue al menos una imagen";
    } else if (images.length > 10) {
        newErrors.images = "Puede cargar un máximo de 10 imágenes";
    }

    materialQualityEntries.forEach((entry, index) => {
      const locationFilled = entry.location.trim() !== '';
      const descriptionFilled = entry.qualityDescription.trim() !== '';

      // Only validate if the entry is not completely empty and it's not the only entry left
      // (assuming the first empty entry is okay if nothing else is added)
      if (locationFilled || descriptionFilled) {
          if (!locationFilled) {
              newErrors[`material_${entry.id}_location`] = `Ingrese la ubicación para la entrada ${index + 1}`;
          }
          if (!descriptionFilled) {
              newErrors[`material_${entry.id}_qualityDescription`] = `Ingrese la descripción para la entrada ${index + 1}`;
          }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [departments, setDepartments] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      console.log("Cleaning up object URLs...");
      images.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);


  return {
    formData,
    setFormData,
    images,
    errors,
    isSubmitting,
    handleImageUpload,
    removeImage,
    handleSubmit,
    departments,
    cities,
    apiError,
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry
  };
}