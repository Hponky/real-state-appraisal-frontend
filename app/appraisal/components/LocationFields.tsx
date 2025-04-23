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

interface LocationFieldsProps {
    formData: AppraisalFormData;
    setFormData: Dispatch<SetStateAction<AppraisalFormData>>;
    errors: Record<string, string>;
    departments: string[];
    cities: string[];
    isLoadingPlaces: boolean;
    placesError: string | null;
}

export function LocationFields({
    formData,
    setFormData,
    errors,
    departments,
    cities,
    isLoadingPlaces,
    placesError,
}: LocationFieldsProps) {
    return (
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
                        {!isLoadingPlaces && !placesError && departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                        {(isLoadingPlaces || placesError) && (
                            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground opacity-50">
                                {isLoadingPlaces ? "Cargando..." : "Error al cargar"}
                            </div>
                        )}
                    </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!formData.department || cities.length === 0}
                >
                    <SelectTrigger id="city">
                        <SelectValue placeholder={!formData.department ? "Seleccione departamento primero" : "Seleccione ciudad"} />
                    </SelectTrigger>
                    <SelectContent>
                        {!isLoadingPlaces && !placesError && formData.department && cities.length > 0 ? (
                            cities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))
                        ) : (
                            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground opacity-50">
                                {isLoadingPlaces ? "Cargando ciudades..." : placesError ? "Error al cargar ciudades" : !formData.department ? "Seleccione departamento primero" : "No hay ciudades disponibles"}
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
        </div>
    );
}