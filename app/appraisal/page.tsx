"use client";

import { useAppraisalForm } from './useAppraisalForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, ArrowLeft } from "lucide-react";
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
    cities
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

            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
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
                    disabled={!formData.department}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Seleccione ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
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
                  />
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
                  />
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
                />
                {errors.expectedValue && <p className="text-sm text-destructive">{errors.expectedValue}</p>}
              </div>

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
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastre las imágenes aquí o haga clic para seleccionar
                    </p>
                  </Label>
                </div>
                {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative group"
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Continuar"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}