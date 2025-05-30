import { useState, useEffect, useCallback, useRef } from "react";

export interface ImageHandlerResult {
  images: string[]; // URLs for preview
  imageFiles: File[]; // Actual file objects
  imageErrors: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  clearImageErrors: () => void;
}

const MAX_IMAGES = 30;

export function useImageHandler(): ImageHandlerResult {
  const [images, setImages] = useState<string[]>([]); // URLs for preview
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Actual file objects
  const [imageErrors, setImageErrors] = useState<string | null>(null);

  // Ref para almacenar las URLs creadas para la limpieza final al desmontar
  const createdObjectUrlsRef = useRef<string[]>([]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImageCount = images.length;
      const allowedNewFiles = MAX_IMAGES - currentImageCount;

      if (allowedNewFiles <= 0) {
        setImageErrors(`Ya ha alcanzado el límite de ${MAX_IMAGES} imágenes.`);
        e.target.value = ''; // Clear the input value
        return; // Exit early if no new files are allowed
      }

      const fileArray = Array.from(files).slice(0, allowedNewFiles);
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));

      setImages(prev => [...prev, ...newImageUrls]);
      setImageFiles(prev => [...prev, ...fileArray]);
      setImageErrors(null); // Clear errors on successful upload

      // Añadir las nuevas URLs al ref para la limpieza final
      createdObjectUrlsRef.current = [...createdObjectUrlsRef.current, ...newImageUrls];

      e.target.value = ''; // Clear the input value
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    const urlToRemove = images[index];
    // Revoke the object URL to prevent memory leaks immediately
    URL.revokeObjectURL(urlToRemove);

    // Eliminar la URL del ref de URLs creadas
    createdObjectUrlsRef.current = createdObjectUrlsRef.current.filter(url => url !== urlToRemove);

    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageErrors(null); // Clear errors when an image is removed
  }, [images]); // Dependency needed to access the correct image URL

  const clearImageErrors = useCallback(() => {
    setImageErrors(null);
  }, []);

  // Effect for cleaning up all remaining object URLs on unmount
  useEffect(() => {
    return () => {
      // Revocar todas las URLs que se crearon y no fueron revocadas por removeImage
      createdObjectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []); // Este efecto solo se ejecuta una vez al montar y una vez al desmontar

  return {
    images,
    imageFiles,
    imageErrors,
    handleImageUpload,
    removeImage,
    clearImageErrors,
  };
}