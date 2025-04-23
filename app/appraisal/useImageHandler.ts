import { useState, useEffect, useCallback } from "react";

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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImageCount = images.length;
      const allowedNewFiles = MAX_IMAGES - currentImageCount;

      if (allowedNewFiles <= 0) {
        setImageErrors(`Ya ha alcanzado el límite de ${MAX_IMAGES} imágenes.`);
        // Clear the input value so the same files can be selected again if needed after removal
        e.target.value = '';
        return;
      }

      // Take only the allowed number of files
      const fileArray = Array.from(files).slice(0, allowedNewFiles);
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));

      setImages(prev => [...prev, ...newImageUrls]);
      setImageFiles(prev => [...prev, ...fileArray]);
      setImageErrors(null); // Clear errors on successful upload

      // Clear the input value
      e.target.value = '';
    }
  }, [images.length]); // Dependency ensures calculation is based on current count

  const removeImage = useCallback((index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(images[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageErrors(null); // Clear errors when an image is removed
  }, [images]); // Dependency needed to access the correct image URL

  const clearImageErrors = useCallback(() => {
    setImageErrors(null);
  }, []);

  // Effect for cleaning up object URLs on unmount or when images change
  useEffect(() => {
    const urlsToRevoke = images; // Capture the current list of URLs
    return () => {
      console.log("Cleaning up image object URLs...");
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]); // Rerun cleanup logic if the images array changes

  return {
    images,
    imageFiles,
    imageErrors,
    handleImageUpload,
    removeImage,
    clearImageErrors,
  };
}