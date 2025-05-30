"use client";
// Forzar recarga de tipos

import useAppraisalForm from './hooks/useAppraisalForm';
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
import { FormProvider } from 'react-hook-form'; // Importar FormProvider

export default function AppraisalForm() {
  const methods = useAppraisalForm(); // Obtener todos los métodos del hook
  const {
    formData,
    images,
    errors,
    isSubmitting,
    handleImageUpload,
    removeImage,
    submitFormData,
    departments,
    cities,
    isLoadingPlaces,
    placesError,
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry,
    handleNumericChange,
    handleStringChange,
    handleBooleanChange,
    handleZonaDeclaratoriaChange,
    handlePotRestrictionsChange,
    handleZonaDeclaratoriaRestriccionesChange,
    showLegalSections,
    setShowLegalSections,
    handleLegalBooleanChange,
    handlePHBooleanChange,
    handlePHStringChange,
  } = methods; // Desestructurar los métodos de 'methods'

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
            <p className="text-muted-foreground mb-8">Complete la información requerida para evaluar su inmueble</p>

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


            <FormProvider {...methods}> {/* Envolver el formulario con FormProvider */}
              <form onSubmit={(e) => { console.log("DEBUG: Form onSubmit event triggered."); methods.handleSubmit(submitFormData)(e); }} className="space-y-6" encType="multipart/form-data" method="POST">
                <LocationFields
                    departments={departments}
                    cities={cities}
                    isLoadingPlaces={isLoadingPlaces}
                    placesError={placesError}
                />

                <PropertyDetailsFields
                    formData={formData}
                    errors={errors}
                    handleNumericChange={handleNumericChange}
                    handleStringChange={handleStringChange}
                />

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

                {/* Toggle para mostrar/ocultar secciones legales */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-legal-sections"
                    checked={showLegalSections}
                    onCheckedChange={setShowLegalSections}
                  />
                  <Label htmlFor="show-legal-sections">Incluir Secciones Legales (Opcional)</Label>
                </div>

                <ImageUploadSection
                    images={images}
                    errors={errors}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                />

                <MaterialQualitySection
                    materialQualityEntries={materialQualityEntries}
                    errors={errors}
                    addMaterialQualityEntry={addMaterialQualityEntry}
                    removeMaterialQualityEntry={removeMaterialQualityEntry}
                    updateMaterialQualityEntry={updateMaterialQualityEntry}
                />

                {/* Renderizar secciones legales condicionalmente */}
                {showLegalSections && (
                  <LegalSections
                    formData={formData}
                    errors={errors}
                    handleStringChange={handleStringChange}
                    handleBooleanChange={handleBooleanChange}
                    handleZonaDeclaratoriaChange={handleZonaDeclaratoriaChange}
                    handlePHBooleanChange={handlePHBooleanChange}
                    handlePHStringChange={handlePHStringChange}
                    handleLegalBooleanChange={handleLegalBooleanChange}
                    handlePotRestrictionsChange={handlePotRestrictionsChange}
                    handleZonaDeclaratoriaRestriccionesChange={handleZonaDeclaratoriaRestriccionesChange}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : "Continuar y Evaluar"}
                </Button>
              </form>
            </FormProvider> {/* Cerrar FormProvider */}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}