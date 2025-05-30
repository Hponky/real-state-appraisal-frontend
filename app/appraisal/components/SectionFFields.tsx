import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";

interface SectionFFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
}

const SectionFFields: React.FC<SectionFFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Sección F: Habitabilidad, Seguridad y Servicios Públicos</h3>
      <Label htmlFor="acceso_servicios_publicos">Acceso a Servicios Públicos</Label>
      <Input
        id="acceso_servicios_publicos"
        value={formData.acceso_servicios_publicos || ''}
        onChange={(e) => handleStringChange('acceso_servicios_publicos', e.target.value)}
      />
      {errors.acceso_servicios_publicos && <p className="text-sm text-destructive">{errors.acceso_servicios_publicos}</p>}

      <LabelWithHint
        htmlFor="condiciones_seguridad_salubridad"
        labelText="Condiciones de Seguridad y Salubridad"
        hintText="Estado físico del inmueble en relación con riesgos estructurales, instalaciones, ventilación, iluminación, etc."
      />
      <Textarea
        id="condiciones_seguridad_salubridad"
        value={formData.condiciones_seguridad_salubridad || ''}
        onChange={(e) => handleStringChange('condiciones_seguridad_salubridad', e.target.value)}
      />
      {errors.condiciones_seguridad_salubridad && <p className="text-sm text-destructive">{errors.condiciones_seguridad_salubridad}</p>}

      <LabelWithHint
        htmlFor="seguros_obligatorios_recomendables"
        labelText="Seguros Obligatorios o Recomendables"
        hintText="Pólizas de seguro requeridas por ley o sugeridas para proteger el inmueble contra riesgos."
      />
      <Input
        id="seguros_obligatorios_recomendables"
        value={formData.seguros_obligatorios_recomendables || ''}
        onChange={(e) => handleStringChange('seguros_obligatorios_recomendables', e.target.value)}
      />
      {errors.seguros_obligatorios_recomendables && <p className="text-sm text-destructive">{errors.seguros_obligatorios_recomendables}</p>}
    </div>
  );
};

export default SectionFFields;