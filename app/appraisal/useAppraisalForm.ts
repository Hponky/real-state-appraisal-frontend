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

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const placesData = await placesApiService.getPlaces();
        if (Array.isArray(placesData)) {
          const departmentNames = placesData.map(place => place.departamento);
          console.log('Available departments:', departmentNames);
          setDepartments(departmentNames);
          setApiError(null);
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
          const selectedDepartment = placesData?.find(
            place => place.departamento === formData.department
          ) || { ciudades: [] };
          
          setCities(selectedDepartment.ciudades);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.department]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store original file objects alongside URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, 10);
      const newImages = fileArray.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 10));
      setImageFiles(prev => [...prev, ...fileArray].slice(0, 10));
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Agregar campos del formulario
      formDataToSend.append('departamento', formData.department);
      formDataToSend.append('ciudad', formData.city);
      formDataToSend.append('direccion', formData.address);
      formDataToSend.append('area', formData.area || '');
      formDataToSend.append('estrato', formData.stratum);
      formDataToSend.append('administracion', formData.adminFee || '');
      formDataToSend.append('valor_esperado', formData.expectedValue);
  
      // Enviar imágenes con nombres únicos
      // Convert images to base64 and add as text
      const base64Images = await Promise.all(
        imageFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      
      base64Images.forEach((base64, index) => {
        formDataToSend.append(`imagen_base64_${index}`, base64);
      });

      // Also keep original files
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`imagen_${index}`, file);
      });
  
      const response = await fetch('http://localhost:5678/webhook-test/recepcion-datos-inmueble', {
        method: 'POST',
        body: formDataToSend,
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }
  
      router.push("/appraisal/results");
    } catch (error) {
      console.error("Error:", error);
      setErrors(prev => ({ ...prev, submit: "Error al enviar el formulario" }));
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.department) newErrors.department = "Seleccione un departamento";
    if (!formData.city) newErrors.city = "Seleccione una ciudad";
    if (!formData.address) newErrors.address = "Ingrese una dirección";
    if (!formData.stratum) newErrors.stratum = "Seleccione un estrato";
    if (!formData.expectedValue) newErrors.expectedValue = "Ingrese el valor esperado";
    if (images.length === 0) newErrors.images = "Cargue al menos una imagen";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [departments, setDepartments] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.department) {
        try {
          const placesData = await placesApiService.getPlaces();
          const selectedDepartment = placesData?.find(
            place => place.departamento === formData.department
          ) || { ciudades: [] };
          
          setCities(selectedDepartment.ciudades);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.department]);

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
    cities
  };
}