import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

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
                <FormField
                  key={item.id}
                  control={control}
                  name="gravamenes_cargas_seleccionados"
                  render={({ field: checkboxField }) => {
                    const currentValues = Array.isArray(checkboxField.value) ? checkboxField.value : [];
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={currentValues.includes(item.id)}
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
                {...field}
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
                <FormField
                  key={item.id}
                  control={control}
                  name="litigios_proceso_judicial_seleccionados"
                  render={({ field: checkboxField }) => {
                    const currentValues = Array.isArray(checkboxField.value) ? checkboxField.value : [];
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={currentValues.includes(item.id)}
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
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SectionEFields;