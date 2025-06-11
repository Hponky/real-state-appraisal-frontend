import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { CommonRestrictionsCheckboxes } from './declaratoria-especial/CommonRestrictionsCheckboxes';
import { OtherRestrictionsRadioGroup } from './declaratoria-especial/OtherRestrictionsRadioGroup';

// Opciones para restricciones POT
const potRestrictionsOptions = [
  { id: 'pot_restriccion_uso_suelo', label: 'Restricción de uso del suelo' },
  { id: 'pot_restriccion_edificabilidad', label: 'Restricción de edificabilidad' },
  { id: 'pot_restriccion_altura', label: 'Restricción de altura' },
  { id: 'pot_afectacion_via_publica', label: 'Afectación por vía pública' },
  { id: 'pot_afectacion_ronda_hidrica', label: 'Afectación por ronda hídrica' },
  { id: 'pot_afectacion_infraestructura_servicios_publicos', label: 'Afectación por infraestructura de servicios públicos' },
  { id: 'pot_otra_restriccion_pot', label: 'Otra restricción POT' },
];

const potRestrictionPlaceholders: Record<string, string> = {
  pot_restriccion_uso_suelo: "Ej: Uso residencial permitido, pero no comercial; Uso mixto con restricciones de horario",
  pot_restriccion_edificabilidad: "Ej: Coeficiente de ocupación máximo del 0.7; Altura máxima de 5 pisos",
  pot_restriccion_altura: "Ej: Altura máxima de 15 metros; Prohibición de construir por encima de la cota 1800",
  pot_afectacion_via_publica: "Ej: Afectación por futura ampliación de la Calle 10; Servidumbre de paso para vía peatonal",
  pot_afectacion_ronda_hidrica: "Ej: Parte del predio en zona de protección de río; Restricción por quebrada o humedal cercano",
  pot_afectacion_infraestructura_servicios_publicos: "Ej: Servidumbre de paso para tubería de acueducto; Afectación por línea de alta tensión",
  pot_otra_restriccion_pot: "Ej: Restricción por plan parcial de desarrollo; Limitación por área de expansión urbana"
};

interface SectionCFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
  handlePotRestrictionChange: (field: keyof AppraisalFormData, selected: boolean, description?: string) => void;
  handleZonaDeclaratoriaChange: (
    field: 'aplica' | 'tipo' | 'fuente' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'restricciones_comunes_descripcion' | 'declaratoriaImponeObligaciones',
    value: boolean | string | undefined
  ) => void;
  handleZonaDeclaratoriaRestriccionesChange: (restriction: string, checked: boolean) => void;
}

const SectionCFields: React.FC<SectionCFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
  handlePotRestrictionChange,
  handleZonaDeclaratoriaChange,
  handleZonaDeclaratoriaRestriccionesChange,
}) => {
  const showOtherPotRestrictionTextarea = formData.pot_otra_restriccion_pot?.selected;

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
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={(formData[option.id as keyof AppraisalFormData] as any)?.selected || false}
                onCheckedChange={(checked: boolean) => {
                  handlePotRestrictionChange(option.id as keyof AppraisalFormData, checked);
                }}
              />
              <Label htmlFor={option.id}>{option.label}</Label>
              {/* Campo de descripción opcional para cada restricción POT */}
              {(formData[option.id as keyof AppraisalFormData] as any)?.selected && option.id !== 'pot_otra_restriccion_pot' && (
                <Input
                  id={`${option.id}_description`}
                  value={(formData[option.id as keyof AppraisalFormData] as any)?.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePotRestrictionChange(option.id as keyof AppraisalFormData, true, e.target.value)}
                  placeholder={potRestrictionPlaceholders[option.id] || "Describir restricción"}
                  className="ml-4"
                />
              )}
            </div>
          ))}
          {showOtherPotRestrictionTextarea && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="pot_otras_restricciones_descripcion">Especificar otra restricción POT</Label>
              <Textarea
                id="pot_otras_restricciones_descripcion"
                value={formData.pot_otra_restriccion_pot?.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handlePotRestrictionChange('pot_otra_restriccion_pot', true, e.target.value)}
              />
              {errors['pot_otra_restriccion_pot.description'] && <p className="text-sm text-destructive">{errors['pot_otra_restriccion_pot.description']}</p>}
            </div>
          )}
        </div>
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

          {/* Nuevo campo para declaratoriaImponeObligaciones */}
          <div className="space-y-2">
            <LabelWithHint
              htmlFor="declaratoriaImponeObligaciones"
              labelText="¿Esta declaratoria impone obligaciones económicas o de mantenimiento específicas al propietario?"
              hintText="Indique si la declaratoria especial conlleva responsabilidades financieras o de conservación para el propietario del inmueble."
            />
            <div className="flex items-center space-x-2">
              <Switch
                id="declaratoriaImponeObligaciones"
                checked={formData.zona_declaratoria_especial?.declaratoriaImponeObligaciones || false}
                onCheckedChange={(checked: boolean) => handleZonaDeclaratoriaChange('declaratoriaImponeObligaciones', checked)}
              />
            </div>
            {errors['zona_declaratoria_especial.declaratoriaImponeObligaciones'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.declaratoriaImponeObligaciones']}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCFields;