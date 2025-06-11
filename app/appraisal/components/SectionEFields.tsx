import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const gravamenesOptions = [
  { id: "hipoteca", label: "Hipoteca" },
  { id: "embargo", label: "Embargo" },
  { id: "servidumbre", label: "Servidumbre" },
  { id: "prenda", label: "Prenda" },
  { id: "usufructo", label: "Usufructo" },
];

const litigiosOptions = [
  { id: "demanda_propiedad", label: "Demanda por propiedad" },
  { id: "proceso_sucesion", label: "Proceso de sucesión" },
  { id: "disputa_linderos", label: "Disputa de linderos" },
  { id: "ejecucion_hipotecaria", label: "Ejecución hipotecaria" },
];

const getGravamenPlaceholderExample = (id: string): string => {
  switch (id) {
    case "hipoteca":
      return "Ej: Hipoteca con Banco Davivienda por $100.000.000.";
    case "embargo":
      return "Ej: Embargo por Juzgado 15 Civil del Circuito, proceso No. 12345.";
    case "servidumbre":
      return "Ej: Servidumbre de tránsito a favor del predio vecino.";
    case "prenda":
      return "Ej: Prenda sobre maquinaria industrial a favor de la empresa XYZ.";
    case "usufructo":
      return "Ej: Usufructo vitalicio a favor de Juan Pérez.";
    default:
      return `Describir ${id.replace(/_/g, ' ')}`;
  }
};

const getLitigioPlaceholderExample = (id: string): string => {
  switch (id) {
    case "demanda_propiedad":
      return "Ej: Demanda de pertenencia sobre una porción del terreno.";
    case "proceso_sucesion":
      return "Ej: Proceso de sucesión intestada de un copropietario.";
    case "disputa_linderos":
      return "Ej: Disputa con el vecino por la ubicación exacta del lindero sur.";
    case "ejecucion_hipotecaria":
      return "Ej: Proceso de ejecución hipotecaria iniciado por Banco ABC.";
    default:
      return `Describir ${id.replace(/_/g, ' ')}`;
  }
};

const SectionEFields: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<AppraisalFormData>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sección E: Estado Legal, Gravámenes y Cargas</h3>

      {/* Gravámenes o Cargas Existentes */}
      <FormField
        control={control}
        name="gravamenes_cargas_seleccionados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gravámenes o Cargas Existentes</FormLabel>
            <div className="flex flex-col space-y-2">
              {gravamenesOptions.map((item) => (
                <div key={item.id}>
                  <FormField
                    control={control}
                    name="gravamenes_cargas_seleccionados"
                    render={({ field: checkboxField }) => {
                      const currentValues = Array.isArray(checkboxField.value) ? checkboxField.value : [];
                      const isChecked = currentValues.includes(item.id);
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? checkboxField.onChange([...currentValues, item.id])
                                  : checkboxField.onChange(
                                      currentValues.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                  {/* Campo de descripción opcional para cada gravamen */}
                  {field.value?.includes(item.id) && (
                    <FormField
                      control={control}
                      name={`gravamen_${item.id}_description` as keyof AppraisalFormData}
                      render={({ field: descriptionField }) => (
                        <FormItem className="ml-8 mt-2">
                          <FormControl>
                            <Input
                              placeholder={getGravamenPlaceholderExample(item.id)}
                              value={descriptionField.value as string || ''} // Aserción de tipo
                              onChange={descriptionField.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="gravamenes_cargas_otros"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Otros Gravámenes o Cargas (especifique)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej: Servidumbre de paso no registrada, hipoteca con banco X, embargo por deuda de impuestos."
                value={field.value as string || ''} // Aserción de tipo
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Litigios o Procesos Judiciales */}
      <FormField
        control={control}
        name="litigios_proceso_judicial_seleccionados"
        render={({ field }) => (
          <FormItem>
            <LabelWithHint
              htmlFor="litigios_proceso_judicial_seleccionados"
              labelText="Litigios o Procesos Judiciales"
              hintText="Disputas legales o acciones judiciales que afectan la propiedad o sus propietarios."
            />
            <div className="flex flex-col space-y-2">
              {litigiosOptions.map((item) => (
                <div key={item.id}>
                  <FormField
                    key={item.id}
                    control={control}
                    name="litigios_proceso_judicial_seleccionados"
                    render={({ field: checkboxField }) => {
                      const currentValues = Array.isArray(checkboxField.value) ? checkboxField.value : [];
                      const isChecked = currentValues.includes(item.id);
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? checkboxField.onChange([...currentValues, item.id])
                                  : checkboxField.onChange(
                                      currentValues.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                  {/* Campo de descripción opcional para cada litigio */}
                  {field.value?.includes(item.id) && (
                    <FormField
                      control={control}
                      name={`litigio_${item.id}_description` as keyof AppraisalFormData}
                      render={({ field: descriptionField }) => (
                        <FormItem className="ml-8 mt-2">
                          <FormControl>
                            <Input
                              placeholder={getLitigioPlaceholderExample(item.id)}
                              value={descriptionField.value as string || ''} // Aserción de tipo
                              onChange={descriptionField.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="litigios_proceso_judicial_otros"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Otros Litigios o Procesos Judiciales (especifique)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej: Demanda por incumplimiento de contrato, proceso de expropiación, disputa por herencia."
                value={field.value as string || ''} // Aserción de tipo
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo para Impuesto Predial al Día */}
      <FormField
        control={control}
        name="impuestoPredialAlDia"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <LabelWithHint
              htmlFor="impuestoPredialAlDia"
              labelText="¿Impuesto Predial al Día?"
              hintText="Indique si el impuesto predial del inmueble se encuentra al día. Esto es fundamental para verificar la situación fiscal del inmueble."
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SectionEFields;