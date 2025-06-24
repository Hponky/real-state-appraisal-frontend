import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// No LabelWithHint needed in this section based on current fields

import { useAppraisalFormContext } from '../context/AppraisalFormContext';

const SectionHFields: React.FC = () => {
  const { formData, errors, handleLegalBooleanChange } = useAppraisalFormContext();
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
          id="informacionVerazCompleta"
          checked={formData.legal_declarations?.informacionVerazCompleta || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('informacionVerazCompleta', checked === true)}
        />
        <Label htmlFor="informacionVerazCompleta">Declaro que la información proporcionada es veraz y completa.</Label>
      </div>
      {errors['legal_declarations.informacionVerazCompleta'] && <p className="text-sm text-destructive">{errors['legal_declarations.informacionVerazCompleta']}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="entendimientoAnalisisLegal"
          checked={formData.legal_declarations?.entendimientoAnalisisLegal || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('entendimientoAnalisisLegal', checked === true)}
        />
        <Label htmlFor="entendimientoAnalisisLegal">Entiendo el alcance del análisis legal y sus implicaciones.</Label>
      </div>
      {errors['legal_declarations.entendimientoAnalisisLegal'] && <p className="text-sm text-destructive">{errors['legal_declarations.entendimientoAnalisisLegal']}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autorizacionTratamientoDatos"
          checked={formData.legal_declarations?.autorizacionTratamientoDatos || false}
          onCheckedChange={(checked) => handleLegalBooleanChange('autorizacionTratamientoDatos', checked === true)}
        />
        <Label htmlFor="autorizacionTratamientoDatos">Autorizo el tratamiento de mis datos personales para el peritaje.</Label>
      </div>
      {errors['legal_declarations.autorizacionTratamientoDatos'] && <p className="text-sm text-destructive">{errors['legal_declarations.autorizacionTratamientoDatos']}</p>}
    </div>
  );
};

export default SectionHFields;