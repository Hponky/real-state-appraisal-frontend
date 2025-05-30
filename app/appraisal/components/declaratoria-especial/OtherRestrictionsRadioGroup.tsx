import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "../LabelWithHint";

interface OtherRestrictionsRadioGroupProps {
  selectedValue: string | undefined;
  otherRestrictionsText: string | undefined;
  onValueChange: (value: string) => void;
  onOtherRestrictionsTextChange: (value: string) => void;
  errors: Record<string, string>;
}

export const OtherRestrictionsRadioGroup: React.FC<OtherRestrictionsRadioGroupProps> = ({
  selectedValue,
  otherRestrictionsText,
  onValueChange,
  onOtherRestrictionsTextChange,
  errors,
}) => {
  const showOtherTextarea = selectedValue === 'Sí, especificar';

  return (
    <div className="space-y-2">
      <LabelWithHint
        htmlFor="zona_declaratoria_especial_otras_restricciones_radio"
        labelText="Otras Restricciones (si aplica)"
        hintText="Indique si existen otras restricciones no listadas anteriormente. Si selecciona 'Sí, especificar', se habilitará un campo para que ingrese los detalles."
      />
      <RadioGroup
        id="zona_declaratoria_especial_otras_restricciones_radio"
        value={selectedValue || ''}
        onValueChange={onValueChange}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="No aplica" id="otras_restricciones_no_aplica" />
          <Label htmlFor="otras_restricciones_no_aplica">No aplica</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Sí, especificar" id="otras_restricciones_si_especificar" />
          <Label htmlFor="otras_restricciones_si_especificar">Sí, especificar</Label>
        </div>
      </RadioGroup>

      {showOtherTextarea && (
        <div className="space-y-2 mt-2">
          <Label htmlFor="zona_declaratoria_especial_otras_restricciones_descripcion">Especificar otras restricciones</Label>
          <Textarea
            id="zona_declaratoria_especial_otras_restricciones_descripcion"
            value={otherRestrictionsText || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onOtherRestrictionsTextChange(e.target.value)}
          />
          {errors['zona_declaratoria_especial.otras_restricciones_descripcion'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.otras_restricciones_descripcion']}</p>}
        </div>
      )}
      {errors['zona_declaratoria_especial.otras_restricciones_seleccion'] && <p className="text-sm text-destructive">{errors['zona_declaratoria_especial.otras_restricciones_seleccion']}</p>}
    </div>
  );
};