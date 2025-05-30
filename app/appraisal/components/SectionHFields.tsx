import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// No LabelWithHint needed in this section based on current fields

interface SectionHFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleLegalBooleanChange: (field: keyof AppraisalFormData['legal_declarations'], checked: boolean) => void;
}

const SectionHFields: React.FC<SectionHFieldsProps> = ({
  formData,
  errors,
  handleLegalBooleanChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Sección H: Declaración y Consentimiento</h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="declaracion_veracidad"
          checked={formData.legal_declarations?.declaracion_veracidad || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('declaracion_veracidad', checked === true)}
        />
        <Label htmlFor="declaracion_veracidad">Declaro que la información proporcionada es veraz.</Label>
      </div>
      {errors['legal_declarations.declaracion_veracidad'] && <p className="text-sm text-destructive">{errors['legal_declarations.declaracion_veracidad']}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="entendimiento_alcance_analisis"
          checked={formData.legal_declarations?.entendimiento_alcance_analisis || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('entendimiento_alcance_analisis', checked === true)}
        />
        <Label htmlFor="entendimiento_alcance_analisis">Entiendo el alcance del análisis basado en esta información.</Label>
      </div>
      {errors['legal_declarations.entendimiento_alcance_analisis'] && <p className="text-sm text-destructive">{errors['legal_declarations.entendimiento_alcance_analisis']}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="declaracion_impuestos_pagados"
          checked={formData.legal_declarations?.declaracion_impuestos_pagados || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('declaracion_impuestos_pagados', checked === true)}
        />
        <Label htmlFor="declaracion_impuestos_pagados">Impuesto Predial al Día</Label>
      </div>
      {errors['legal_declarations.declaracion_impuestos_pagados'] && <p className="text-sm text-destructive">{errors['legal_declarations.declaracion_impuestos_pagados']}</p>}
    </div>
  );
};

export default SectionHFields;