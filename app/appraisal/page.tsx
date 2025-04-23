"use client";

import { useAppraisalForm } from './useAppraisalForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationFields } from './components/LocationFields';
import { PropertyDetailsFields } from './components/PropertyDetailsFields';
import { ImageUploadSection } from './components/ImageUploadSection';
import { MaterialQualitySection } from './components/MaterialQualitySection';
import { ArrowLeft } from "lucide-react"; // Only ArrowLeft is used directly
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AppraisalForm() {
  const {
    formData,
    setFormData,
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
    handleNumericChange
  } = useAppraisalForm();

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

             {errors.submit && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
                <p>{errors.submit}</p>
              </div>
            )}

            <form onSubmit={submitFormData} className="space-y-6" encType="multipart/form-data">
              <LocationFields
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  departments={departments}
                  cities={cities}
                  isLoadingPlaces={isLoadingPlaces}
                  placesError={placesError}
              />

              <PropertyDetailsFields
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  handleNumericChange={handleNumericChange}
              />

              <div className="space-y-2">
                <Label htmlFor="expectedValue">Valor Esperado del Arriendo (COP)</Label>
                <Input
                  id="expectedValue"
                  type="number"
                  value={formData.expectedValue}
                  onChange={(e) => handleNumericChange('expectedValue', e.target.value)}
                  placeholder="Ej: 1500000"
                  min="0"
                />
                {errors.expectedValue && <p className="text-sm text-destructive">{errors.expectedValue}</p>}
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Continuar y Evaluar"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}