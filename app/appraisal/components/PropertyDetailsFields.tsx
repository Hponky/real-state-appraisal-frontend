import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppraisalFormData } from "../hooks/appraisalFormSchema";
import { useAppraisalFormContext } from "../context/AppraisalFormContext";

export function PropertyDetailsFields() {
    const {
        formData,
        errors,
        handleNumericChange,
        handleStringChange,
    } = useAppraisalFormContext();
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="built_area">Área Construida (m²)</Label>
                <Input
                    id="built_area"
                    type="number"
                    value={formData.built_area}
                    onChange={(e) => handleNumericChange('built_area', e.target.value)}
                    placeholder="Ej: 80"
                    min="0"
                />
                {errors.built_area && <p className="text-sm text-destructive">{errors.built_area}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="estrato">Estrato</Label>
                <Select
                    value={formData.estrato}
                    onValueChange={(value) => handleStringChange('estrato', value)}
                >
                    <SelectTrigger id="estrato">
                        <SelectValue placeholder="Seleccione estrato" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((estrato) => (
                            <SelectItem key={estrato} value={estrato.toString()}>
                                Estrato {estrato}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.estrato && <p className="text-sm text-destructive">{errors.estrato}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="property_type">Tipo de Inmueble</Label>
                <Select
                    value={formData.property_type}
                    onValueChange={(value) => handleStringChange('property_type', value)}
                >
                    <SelectTrigger id="property_type">
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
                {errors.property_type && <p className="text-sm text-destructive">{errors.property_type}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="admin_fee">Administración (COP) - Opcional</Label>
                <Input
                    id="admin_fee"
                    type="number"
                    value={formData.admin_fee ?? ''}
                    onChange={(e) => handleNumericChange('admin_fee', e.target.value)}
                    placeholder="Ej: 200000"
                    min="0"
                />
                {errors.admin_fee && <p className="text-sm text-destructive">{errors.admin_fee}</p>}
            </div>
        </div>
    );
}