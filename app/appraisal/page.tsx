"use client";
// Forzar recarga de tipos

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationFields } from './components/LocationFields';
import { PropertyDetailsFields } from './components/PropertyDetailsFields';
import { ImageUploadSection } from './components/ImageUploadSection';
import { MaterialQualitySection } from './components/MaterialQualitySection';
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import LegalSections from './components/LegalSections';
import { Switch } from "@/components/ui/switch";
import { FormProvider as RHFFormProvider } from 'react-hook-form';
import { AppraisalFormProvider, useAppraisalFormContext } from './context/AppraisalFormContext';

// Componente de formulario interno que consume el contexto
const AppraisalFormContent = () => {
  const {
    methods,
    formData,
    errors,
    isSubmitting,
    submitFormData,
    departments,
    cities,
    isLoadingPlaces,
    placesError,
    showLegalSections,
    setShowLegalSections,
    useTestValues,
    setUseTestValues,
    handleNumericChange,
  } = useAppraisalFormContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <Card className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-2">Ingreso de Datos del Inmueble</h1>
            <p className="text-muted-foreground mb-4">Complete la información requerida para evaluar su inmueble</p>

            <div className="flex items-center space-x-2 mb-8">
              <Switch
                id="use-test-data"
                checked={useTestValues}
                onCheckedChange={setUseTestValues}
              />
              <Label htmlFor="use-test-data">Usar datos de prueba (solo para desarrollo)</Label>
            </div>

            {placesError && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
                <p>{placesError}</p>
              </div>
            )}
            {isLoadingPlaces && (
                 <div className="mb-4 p-4 bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
                    <p>Cargando datos de ubicación...</p>
                 </div>
            )}

            <RHFFormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(submitFormData, (formErrors) => { console.error("Form validation errors (page.tsx):", formErrors); })} className="space-y-6" encType="multipart/form-data" method="POST">
                <LocationFields />
                <PropertyDetailsFields />

                <div className="space-y-2">
                  <Label htmlFor="expectedValue">Valor Esperado del Arriendo (COP)</Label>
                  <Input
                    id="expectedValue"
                    type="number"
                    value={formData.expectedValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNumericChange('expectedValue', e.target.value)}
                    placeholder="Ej: 1500000"
                    min="0"
                  />
                  {errors.expectedValue && <p className="text-sm text-destructive">{errors.expectedValue}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-legal-sections"
                    checked={showLegalSections}
                    onCheckedChange={setShowLegalSections}
                  />
                  <Label htmlFor="show-legal-sections">Incluir Secciones Legales (Opcional)</Label>
                </div>

                <ImageUploadSection />
                <MaterialQualitySection />

                {showLegalSections && <LegalSections />}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : "Continuar y Evaluar"}
                </Button>
              </form>
            </RHFFormProvider>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Componente principal que envuelve todo en el proveedor
export default function AppraisalForm() {
  return (
    <AppraisalFormProvider>
      <AppraisalFormContent />
    </AppraisalFormProvider>
  );
}