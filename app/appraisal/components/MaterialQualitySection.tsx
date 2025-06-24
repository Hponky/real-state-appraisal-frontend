import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAppraisalFormContext } from "../context/AppraisalFormContext";

export function MaterialQualitySection() {
    const {
        materialQualityEntries,
        errors,
        addMaterialQualityEntry,
        removeMaterialQualityEntry,
        updateMaterialQualityEntry,
    } = useAppraisalFormContext();
    return (
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
                    className="p-4 border rounded-md space-y-3 relative bg-card/50"
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
                        {materialQualityEntries.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMaterialQualityEntry(entry.id)}
                                className="text-muted-foreground hover:text-destructive mt-6 sm:mt-0"
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
                className="w-full sm:w-auto"
            >
                <Plus size={16} className="mr-2" />
                Añadir otra ubicación
            </Button>
        </div>
    );
}