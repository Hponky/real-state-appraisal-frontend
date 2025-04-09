"use client";

import { useAppraisalForm } from './useAppraisalForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { X, Upload, ArrowLeft, Trash2, Plus } from "lucide-react"; // Import Trash2 and Plus
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    handleSubmit,
    departments,
    cities,
    apiError, // Get apiError
    // Destructure new state and functions
    materialQualityEntries,
    addMaterialQualityEntry,
    removeMaterialQualityEntry,
    updateMaterialQualityEntry
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

            {/* Display API Error if exists */}
            {apiError && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
                <p>{apiError}</p>
              </div>
            )}

            {/* Display general submission error */}
             {errors.submit && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
                <p>{errors.submit}</p>
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {/* --- Existing Fields Start --- */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value, city: "" })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Seleccione departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!formData.department || cities.length === 0} // Disable if no department or no cities
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder={!formData.department ? "Seleccione departamento primero" : "Seleccione ciudad"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))
                      ) : (
                        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground opacity-50">
                          No hay ciudades disponibles
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Calle 123 #45-67"
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²) - Opcional</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Ej: 80"
                    min="0" // Add min attribute
                  />
                   {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stratum">Estrato</Label>
                  <Select
                    value={formData.stratum}
                    onValueChange={(value) => setFormData({ ...formData, stratum: value })}
                  >
                    <SelectTrigger id="stratum">
                      <SelectValue placeholder="Seleccione estrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((stratum) => (
                        <SelectItem key={stratum} value={stratum.toString()}>
                          Estrato {stratum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stratum && <p className="text-sm text-destructive">{errors.stratum}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminFee">Administración (COP) - Opcional</Label>
                  <Input
                    id="adminFee"
                    type="number"
                    value={formData.adminFee}
                    onChange={(e) => setFormData({ ...formData, adminFee: e.target.value })}
                    placeholder="Ej: 200000"
                    min="0" // Add min attribute
                  />
                   {errors.adminFee && <p className="text-sm text-destructive">{errors.adminFee}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedValue">Valor Esperado del Arriendo (COP)</Label>
                <Input
                  id="expectedValue"
                  type="number"
                  value={formData.expectedValue}
                  onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                  placeholder="Ej: 1500000"
                  min="0" // Add min attribute
                />
                {errors.expectedValue && <p className="text-sm text-destructive">{errors.expectedValue}</p>}
              </div>
              {/* --- Existing Fields End --- */}

              {/* --- Image Upload Section --- */}
              <div className="space-y-2">
                <Label htmlFor="images">Fotografías del Inmueble (máximo 10)</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 10} // Disable if max reached
                  />
                  <Label htmlFor="images" className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {images.length >= 10
                        ? "Máximo de 10 imágenes alcanzado"
                        : "Arrastre las imágenes aquí o haga clic para seleccionar"}
                    </p>
                  </Label>
                </div>
                {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
              </div>

              {/* --- Image Preview Grid --- */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={image} // Use image URL as key if unique, or manage IDs
                    layout // Add layout animation
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }} // Add exit animation
                    transition={{ duration: 0.2 }}
                    className="relative group aspect-square" // Use aspect ratio for consistent size
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border" // Add border
                    />
                    <Button
                      type="button"
                      variant="destructive" // Use button variant
                      size="icon" // Use icon size
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Eliminar imagen ${index + 1}`}
                    >
                      <X size={14} />
                    </Button>
                  </motion.div>
                ))}
              </div>
              {/* --- End Image Preview Grid --- */}


              {/* --- NEW: Material Quality Dynamic Section --- */}
              <div className="space-y-4 border-t pt-6">
                 <h2 className="text-xl font-semibold">Detalles de Calidad de Materiales (Opcional)</h2>
                 <p className="text-sm text-muted-foreground">Añada detalles sobre la calidad de los materiales en diferentes ubicaciones del inmueble.</p>

                 {materialQualityEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-md space-y-3 relative bg-card/50" // Added background
                    >
                      <Label className="font-medium">Ubicación {index + 1}</Label>
                      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start">
                          <div className="space-y-2">
                              <Label htmlFor={`material_location_${entry.id}`} className="text-xs text-muted-foreground">Sitio del Inmueble</Label>
                              <Input
                                  id={`material_location_${entry.id}`}
                                  value={entry.location}
                                  onChange={(e) => updateMaterialQualityEntry(entry.id, 'location', e.target.value)}
                                  placeholder="Ej: Cocina, Baño Principal, Fachada"
                              />
                              {errors[`material_${entry.id}_location`] && <p className="text-sm text-destructive">{errors[`material_${entry.id}_location`]}</p>}
                          </div>
                           {/* Show remove button only if more than one entry exists */}
                           {materialQualityEntries.length > 1 && (
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMaterialQualityEntry(entry.id)}
                                  className="text-muted-foreground hover:text-destructive mt-6 sm:mt-0" // Adjusted margin for alignment
                                  aria-label={`Eliminar ubicación ${index + 1}`}
                              >
                                  <Trash2 size={16} />
                              </Button>
                           )}
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`material_description_${entry.id}`} className="text-xs text-muted-foreground">Descripción de Calidad</Label>
                          <Textarea
                              id={`material_description_${entry.id}`}
                              value={entry.qualityDescription}
                              onChange={(e) => updateMaterialQualityEntry(entry.id, 'qualityDescription', e.target.value)}
                              placeholder="Describa la calidad de los materiales (ej: pisos de mármol en buen estado, ventanas de aluminio estándar, pintura desgastada)"
                              rows={3}
                          />
                          {errors[`material_${entry.id}_qualityDescription`] && <p className="text-sm text-destructive">{errors[`material_${entry.id}_qualityDescription`]}</p>}
                      </div>
                    </motion.div>
                 ))}

                 <Button
                    type="button"
                    variant="outline"
                    onClick={addMaterialQualityEntry}
                    className="w-full sm:w-auto" // Full width on small screens, auto on larger
                 >
                    <Plus size={16} className="mr-2" />
                    Añadir otra ubicación
                 </Button>
              </div>
              {/* --- END: Material Quality Dynamic Section --- */}


              {/* --- Submit Button --- */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Continuar y Evaluar"}
              </Button>
              {/* --- End Submit Button --- */}
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}