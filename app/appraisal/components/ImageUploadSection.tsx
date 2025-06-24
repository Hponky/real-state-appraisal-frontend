import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image"; // Import Image component
import { useAppraisalFormContext } from "../context/AppraisalFormContext";

export function ImageUploadSection() {
    const {
        images,
        errors,
        handleImageUpload,
        removeImage,
    } = useAppraisalFormContext();
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="images">Fotografías del Inmueble (máximo 30)</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <input
                        type="file"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={images.length >= 30}
                    />
                    <Label htmlFor="images" className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {images.length >= 30
                                ? "Máximo de 30 imágenes alcanzado"
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
                        key={image}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="relative group aspect-square"
                    >
                        <Image
                            src={image}
                            alt={`Property ${index + 1}`}
                            fill // Use fill to make image take up parent's size
                            className="object-cover rounded-lg border"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Responsive sizes
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
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
        </>
    );
}
