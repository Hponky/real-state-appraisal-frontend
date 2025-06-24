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
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useAppraisalFormContext } from "../context/AppraisalFormContext";

export function LocationFields() {
  const { control, formState: { errors }, setValue, watch } = useFormContext<AppraisalFormData>();
  const { departments, cities, isLoadingPlaces, placesError } = useAppraisalFormContext();
  const formData = watch();

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
                setValue("city", "");
              }}
            >
              <FormControl>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Seleccione departamento" />
                </SelectTrigger>
              </FormControl>
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
              disabled={!formData.department || cities.length === 0 || isLoadingPlaces}
            >
              <FormControl>
                <SelectTrigger id="city">
                  <SelectValue placeholder={!formData.department ? "Seleccione departamento primero" : "Seleccione ciudad"} />
                </SelectTrigger>
              </FormControl>
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