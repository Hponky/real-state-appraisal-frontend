import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "../LabelWithHint";
import { declaratoriaRestrictionsOptions } from './declaratoriaRestrictionsOptions';

interface CommonRestrictionsCheckboxesProps {
  type: string | undefined;
  selectedRestrictions: string[] | undefined;
  handleZonaDeclaratoriaRestriccionesChange: (restriction: string, checked: boolean) => void;
  handleOtherCommonRestrictionChange: (value: string) => void;
  otherCommonRestrictionText: string | undefined;
  errors: Record<string, string>;
}

export const CommonRestrictionsCheckboxes: React.FC<CommonRestrictionsCheckboxesProps> = ({
  type,
  selectedRestrictions,
  handleZonaDeclaratoriaRestriccionesChange,
  handleOtherCommonRestrictionChange,
  otherCommonRestrictionText,
  errors,
}) => {
  const config = type ? declaratoriaRestrictionsOptions[type] : undefined;
  const otherOption = 'Otra';
  const showOtherTextarea = selectedRestrictions?.includes(otherOption);

  if (!config) {
    return null;
  }

  return (
    <div className="space-y-2">
      <LabelWithHint
        labelText={config.label}
        hintText={config.hint}
      />
      <div className="space-y-2">
        {config.options.map((option: string) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`restriccion_${option.replace(/\s+/g, '_').toLowerCase()}`}
              checked={selectedRestrictions?.includes(option) || false}
              onCheckedChange={(checked: boolean) => handleZonaDeclaratoriaRestriccionesChange(option, checked)}
            />
            <Label htmlFor={`restriccion_${option.replace(/\s+/g, '_').toLowerCase()}`}>{option}</Label>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`restriccion_${otherOption.replace(/\s+/g, '_').toLowerCase()}`}
            checked={selectedRestrictions?.includes(otherOption) || false}
            onCheckedChange={(checked: boolean) => handleZonaDeclaratoriaRestriccionesChange(otherOption, checked)}
          />
          <Label htmlFor={`restriccion_${otherOption.replace(/\s+/g, '_').toLowerCase()}`}>{otherOption}</Label>
        </div>
      </div>
      {showOtherTextarea && (
        <div className="space-y-2 mt-2">
          <Label htmlFor="zona_declaratoria_especial_restricciones_comunes_descripcion">Especificar otra restricción común</Label>
          <Textarea
            id="zona_declaratoria_especial_restricciones_comunes_descripcion"
            value={otherCommonRestrictionText || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOtherCommonRestrictionChange(e.target.value)}
          />
          {errors['zona_declaratoria_especial.restricciones_comunes_descripcion'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.restricciones_comunes_descripcion']}</p>}
        </div>
      )}
      {errors['zona_declaratoria_especial.restricciones_comunes'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.restricciones_comunes']}</p>}
    </div>
  );
};