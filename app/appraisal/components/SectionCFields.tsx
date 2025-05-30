import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { declaratoriaRestrictionsOptions } from './declaratoria-especial/declaratoriaRestrictionsOptions';
import { CommonRestrictionsCheckboxes } from './declaratoria-especial/CommonRestrictionsCheckboxes';
import { OtherRestrictionsRadioGroup } from './declaratoria-especial/OtherRestrictionsRadioGroup';

// Opciones para restricciones POT
const potRestrictionsOptions = [
  'Restricción de uso del suelo',
  'Restricción de edificabilidad',
  'Restricción de altura',
  'Afectación por vía pública',
  'Afectación por ronda hídrica',
  'Afectación por infraestructura de servicios públicos',
  'Otra restricción POT',
];

interface SectionCFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
  handlePotRestrictionsChange: (value: string[]) => void;
  handleZonaDeclaratoriaChange: (
    field: 'aplica' | 'tipo' | 'fuente' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'restricciones_comunes_descripcion',
    value: boolean | string | undefined
  ) => void;
  handleZonaDeclaratoriaRestriccionesChange: (restriction: string, checked: boolean) => void;
}

const SectionCFields: React.FC<SectionCFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
  handlePotRestrictionsChange,
  handleZonaDeclaratoriaChange,
  handleZonaDeclaratoriaRestriccionesChange,
}) => {
  const showOtherPotRestrictionTextarea = formData.pot_restrictions?.includes('Otra restricción POT');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sección C: Restricciones y Afectaciones</h3>

      {/* Checkboxes para restricciones POT */}
      <div className="space-y-2">
        <LabelWithHint
          htmlFor="pot_restrictions"
          labelText="Restricciones POT (Plan de Ordenamiento Territorial)"
          hintText="Seleccione las restricciones de uso, edificabilidad o altura según el Plan de Ordenamiento Territorial (POT) del municipio que apliquen al inmueble. Esto puede afectar el potencial de desarrollo o modificación del inmueble."
        />
        <div className="space-y-2">
          {potRestrictionsOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`pot_restriccion_${option.replace(/\s+/g, '_').toLowerCase()}`}
                checked={formData.pot_restrictions?.includes(option) || false}
                onCheckedChange={(checked: boolean) => {
                  const currentRestrictions = formData.pot_restrictions || [];
                  const newRestrictions = checked
                    ? [...currentRestrictions, option]
                    : currentRestrictions.filter((r) => r !== option);
                  handlePotRestrictionsChange(newRestrictions);
                }}
              />
              <Label htmlFor={`pot_restriccion_${option.replace(/\s+/g, '_').toLowerCase()}`}>{option}</Label>
            </div>
          ))}
          {showOtherPotRestrictionTextarea && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="pot_otras_restricciones_descripcion">Especificar otra restricción POT</Label>
              <Textarea
                id="pot_otras_restricciones_descripcion"
                value={formData.pot_otras_restricciones_descripcion || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStringChange('pot_otras_restricciones_descripcion', e.target.value)}
              />
              {errors.pot_otras_restricciones_descripcion && <p className="text-sm text-destructive">{errors.pot_otras_restricciones_descripcion}</p>}
            </div>
          )}
        </div>
        {errors.pot_restrictions && <p className="text-sm text-destructive">{errors.pot_restrictions}</p>}
      </div>

      {/* Checkbox para zona_declaratoria_especial.aplica */}
      <div className="space-y-2">
        <LabelWithHint
          htmlFor="zona_declaratoria_especial_aplica"
          labelText="¿El inmueble se encuentra en una zona de declaratoria especial?"
          hintText="Indica si el inmueble está ubicado en un área con regulaciones específicas por su valor histórico, cultural, ambiental, etc. Puedes verificar esta información en el certificado de tradición y libertad, el POT o contactando la oficina de planeación municipal o el Ministerio de Cultura."
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="zona_declaratoria_especial_aplica"
            checked={formData.zona_declaratoria_especial?.aplica || false}
            onCheckedChange={(checked: boolean) => handleZonaDeclaratoriaChange('aplica', checked)}
          />
        </div>
        {errors['zona_declaratoria_especial.aplica'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.aplica']}</p>}
      </div>

      {/* Campos condicionales para zona_declaratoria_especial */}
      {formData.zona_declaratoria_especial?.aplica && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zona_declaratoria_especial_tipo">Tipo de Declaratoria Especial</Label>
            <Select
              onValueChange={(value: string) => handleZonaDeclaratoriaChange('tipo', value)}
              value={formData.zona_declaratoria_especial?.tipo || ''}
            >
              <SelectTrigger id="zona_declaratoria_especial_tipo">
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Histórica (Bien de Interés Cultural - BIC)">Histórica (Bien de Interés Cultural - BIC)</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Ambiental">Ambiental</SelectItem>
                <SelectItem value="De Riesgo">De Riesgo</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
              </SelectContent>
            </Select>
            {errors['zona_declaratoria_especial.tipo'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.tipo']}</p>}
          </div>

          {/* Checkboxes para restricciones comunes */}
          <CommonRestrictionsCheckboxes
            type={formData.zona_declaratoria_especial?.tipo}
            selectedRestrictions={formData.zona_declaratoria_especial?.restricciones_comunes || []}
            handleZonaDeclaratoriaRestriccionesChange={handleZonaDeclaratoriaRestriccionesChange}
            handleOtherCommonRestrictionChange={(value: string) => handleZonaDeclaratoriaChange('restricciones_comunes_descripcion', value)}
            otherCommonRestrictionText={formData.zona_declaratoria_especial?.restricciones_comunes_descripcion}
            errors={errors}
          />

          {/* Campo de texto para descripción adicional de restricciones comunes */}
          {/* Este textarea ahora se maneja dentro de CommonRestrictionsCheckboxes */}
          {/* <div className="space-y-2">
            <LabelWithHint
              htmlFor="zona_declaratoria_especial_restricciones_comunes_descripcion"
              labelText="Descripción Adicional de Restricciones Comunes"
              hintText="Describa cualquier restricción común adicional no cubierta por las opciones anteriores."
            />
            <Textarea
              id="zona_declaratoria_especial_restricciones_comunes_descripcion"
              value={formData.zona_declaratoria_especial?.restricciones_comunes_descripcion || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleZonaDeclaratoriaChange('restricciones_comunes_descripcion', e.target.value)}
            />
            {errors['zona_declaratoria_especial.restricciones_comunes_descripcion'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.restricciones_comunes_descripcion']}</p>}
          </div> */}

          <OtherRestrictionsRadioGroup
            selectedValue={formData.zona_declaratoria_especial?.otras_restricciones_seleccion}
            otherRestrictionsText={formData.zona_declaratoria_especial?.otras_restricciones_descripcion}
            onValueChange={(value: string) => handleZonaDeclaratoriaChange('otras_restricciones_seleccion', value)}
            onOtherRestrictionsTextChange={(value: string) => handleZonaDeclaratoriaChange('otras_restricciones_descripcion', value)}
            errors={errors}
          />

          <div className="space-y-2">
            <Label htmlFor="zona_declaratoria_especial_fuente">Fuente de la Declaratoria</Label>
            <Input
              id="zona_declaratoria_especial_fuente"
              value={formData.zona_declaratoria_especial?.fuente || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleZonaDeclaratoriaChange('fuente', e.target.value)}
            />
            {errors['zona_declaratoria_especial.fuente'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.fuente']}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCFields;