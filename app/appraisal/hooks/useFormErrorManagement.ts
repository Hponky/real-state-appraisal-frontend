import { useState, useCallback } from 'react';

export function useFormErrorManagement() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFormErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  return {
    errors,
    setErrors, // Export directly the useState's setErrors
  };
}