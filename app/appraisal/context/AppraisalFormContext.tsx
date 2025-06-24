"use client";

import { createContext, useContext, ReactNode } from 'react';
import useAppraisalForm from '../hooks/useAppraisalForm';

// Definir el tipo para el valor del contexto
type AppraisalFormContextType = ReturnType<typeof useAppraisalForm>;

// Crear el contexto con un valor inicial de null
const AppraisalFormContext = createContext<AppraisalFormContextType | null>(null);

// Crear un hook personalizado para consumir el contexto
export const useAppraisalFormContext = () => {
  const context = useContext(AppraisalFormContext);
  if (!context) {
    throw new Error('useAppraisalFormContext must be used within an AppraisalFormProvider');
  }
  return context;
};

// Crear el proveedor del contexto
export const AppraisalFormProvider = ({ children }: { children: ReactNode }) => {
  const formMethods = useAppraisalForm();
  return (
    <AppraisalFormContext.Provider value={formMethods}>
      {children}
    </AppraisalFormContext.Provider>
  );
};