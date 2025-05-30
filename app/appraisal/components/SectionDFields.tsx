import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// No LabelWithHint needed in this section based on current fields

interface SectionDFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
}

const SectionDFields: React.FC<SectionDFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Sección D: Condiciones del Contrato de Arrendamiento</h3>
      <Label htmlFor="contrato_escrito_vigente">Contrato Escrito Vigente</Label>
      <Input
        id="contrato_escrito_vigente"
        value={formData.contrato_escrito_vigente || ''}
        onChange={(e) => handleStringChange('contrato_escrito_vigente', e.target.value)}
      />
      {errors.contrato_escrito_vigente && <p className="text-sm text-destructive">{errors.contrato_escrito_vigente}</p>}

      <Label htmlFor="preferencia_requisito_futuro_contrato">Preferencia o Requisito para Futuro Contrato</Label>
      <Textarea
        id="preferencia_requisito_futuro_contrato"
        value={formData.preferencia_requisito_futuro_contrato || ''}
        onChange={(e) => handleStringChange('preferencia_requisito_futuro_contrato', e.target.value)}
      />
      {errors.preferencia_requisito_futuro_contrato && <p className="text-sm text-destructive">{errors.preferencia_requisito_futuro_contrato}</p>}

      <Label htmlFor="responsable_servicios_publicos">Responsable del Pago de Servicios Públicos</Label>
      <Input
        id="responsable_servicios_publicos"
        value={formData.responsable_servicios_publicos || ''}
        onChange={(e) => handleStringChange('responsable_servicios_publicos', e.target.value)}
      />
      {errors.responsable_servicios_publicos && <p className="text-sm text-destructive">{errors.responsable_servable_servicios_publicos}</p>}
    </div>
  );
};

export default SectionDFields;