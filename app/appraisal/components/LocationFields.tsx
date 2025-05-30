import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { AppraisalFormData } from "../hooks/appraisalFormSchema";
import { useLocationData } from "../hooks/useLocationData";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface LocationFieldsProps {
  departments: string[];
  cities: string[];
  isLoadingPlaces: boolean;
  placesError: string | null;
}

export function LocationFields({
  departments,
  cities,
  isLoadingPlaces,
  placesError,
}: LocationFieldsProps) {
  const { control, formState: { errors }, setValue, watch } = useFormContext<AppraisalFormData>();
  const formData = watch(); // Obtener los datos del formulario para los valores de los campos

  const { departments: fetchedDepartments, cities: fetchedCities, isLoadingPlaces: isLoadingLocationData, placesError: locationDataError } = useLocationData(formData.department || "");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="department">Departamento</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setValue("city", ""); // Reset city when department changes
              }}
            >
              <FormControl>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Seleccione departamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {!isLoadingLocationData && !locationDataError && fetchedDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
                {(isLoadingLocationData || locationDataError) && (
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground opacity-50">
                    {isLoadingLocationData ? "Cargando..." : "Error al cargar"}
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="city">Ciudad</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!formData.department || fetchedCities.length === 0 || isLoadingLocationData}
            >
              <FormControl>
                <SelectTrigger id="city">
                  <SelectValue placeholder={!formData.department ? "Seleccione departamento primero" : "Seleccione ciudad"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {!isLoadingLocationData && !locationDataError && formData.department && fetchedCities.length > 0 ? (
                  fetchedCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))
                ) : (
                  <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm text-muted-foreground opacity-50">
                    {isLoadingLocationData ? "Cargando ciudades..." : locationDataError ? "Error al cargar ciudades" : !formData.department ? "Seleccione departamento primero" : "No hay ciudades disponibles"}
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor="address">Dirección</FormLabel>
            <FormControl>
              <Input
                id="address"
                placeholder="Ej: Calle 123 #45-67"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}