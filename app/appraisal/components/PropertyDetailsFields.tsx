import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppraisalFormData } from "../appraisalFormSchema";
import { Dispatch, SetStateAction } from "react";

interface PropertyDetailsFieldsProps {
    formData: AppraisalFormData;
    setFormData: Dispatch<SetStateAction<AppraisalFormData>>;
    errors: Record<string, string>;
    handleNumericChange: (field: keyof AppraisalFormData, value: string) => void;
}

export function PropertyDetailsFields({
    formData,
    setFormData,
    errors,
    handleNumericChange,
}: PropertyDetailsFieldsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="area">Área (m²) - Opcional</Label>
                <Input
                    id="area"
                    type="number"
                    value={formData.area ?? ''}
                    onChange={(e) => handleNumericChange('area', e.target.value)}
                    placeholder="Ej: 80"
                    min="0"
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
                <Label htmlFor="propertyType">Tipo de Inmueble</Label>
                <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                >
                    <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Seleccione tipo de inmueble" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Casa lote">Casa lote</SelectItem>
                        <SelectItem value="Casa Recreo">Casa Recreo</SelectItem>
                        <SelectItem value="Edificio">Edificio</SelectItem>
                        <SelectItem value="Local Comercial">Local Comercial</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="Garaje">Garaje</SelectItem>
                    </SelectContent>
                </Select>
                {errors.propertyType && <p className="text-sm text-destructive">{errors.propertyType}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="adminFee">Administración (COP) - Opcional</Label>
                <Input
                    id="adminFee"
                    type="number"
                    value={formData.adminFee ?? ''}
                    onChange={(e) => handleNumericChange('adminFee', e.target.value)}
                    placeholder="Ej: 200000"
                    min="0"
                />
                {errors.adminFee && <p className="text-sm text-destructive">{errors.adminFee}</p>}
            </div>
        </div>
    );
}