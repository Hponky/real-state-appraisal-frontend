import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import LabelWithHint from "./LabelWithHint";

interface SectionGFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
}

const SectionGFields: React.FC<SectionGFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Sección G: Documentación Disponible</h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_certificado_tradicion_libertad"
          checked={formData.documento_certificado_tradicion_libertad || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_certificado_tradicion_libertad', checked === true)}
        />
        <Label htmlFor="documento_certificado_tradicion_libertad">Certificado de Tradición y Libertad</Label>
      </div>
      {errors.documento_certificado_tradicion_libertad && <p className="text-sm text-destructive">{errors.documento_certificado_tradicion_libertad}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_escritura_publica"
          checked={formData.documento_escritura_publica || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_escritura_publica', checked === true)}
        />
        <Label htmlFor="documento_escritura_publica">Escritura Pública</Label>
      </div>
      {errors.documento_escritura_publica && <p className="text-sm text-destructive">{errors.documento_escritura_publica}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_recibo_impuesto_predial"
          checked={formData.documento_recibo_impuesto_predial || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_recibo_impuesto_predial', checked === true)}
        />
        <Label htmlFor="documento_recibo_impuesto_predial">Recibo de Impuesto Predial</Label>
      </div>
      {errors.documento_recibo_impuesto_predial && <p className="text-sm text-destructive">{errors.documento_recibo_impuesto_predial}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_paz_salvo_administracion"
          checked={formData.documento_paz_salvo_administracion || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_paz_salvo_administracion', checked === true)}
        />
        <Label htmlFor="documento_paz_salvo_administracion">¿Tiene a la mano el Paz y Salvo de Administración?</Label>
      </div>
      {errors.documento_paz_salvo_administracion && <p className="text-sm text-destructive">{errors.documento_paz_salvo_administracion}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_reglamento_ph"
          checked={formData.documento_reglamento_ph || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_reglamento_ph', checked === true)}
        />
        <LabelWithHint
          htmlFor="documento_reglamento_ph"
          labelText="¿Tiene a la mano el Reglamento de Propiedad Horizontal?"
          hintText="Documento que establece las normas de convivencia, uso de áreas comunes y administración en un edificio o conjunto sometido a Propiedad Horizontal."
        />
      </div>
      {errors.documento_reglamento_ph && <p className="text-sm text-destructive">{errors.documento_reglamento_ph}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="documento_ficha_predial_catastral"
          checked={formData.documento_ficha_predial_catastral || false}
          onCheckedChange={(checked) => handleBooleanChange('documento_ficha_predial_catastral', checked === true)}
        />
        <Label htmlFor="documento_ficha_predial_catastral">Ficha Predial Catastral o Boletín Catastral</Label>
      </div>
      {errors.documento_ficha_predial_catastral && <p className="text-sm text-destructive">{errors.documento_ficha_predial_catastral}</p>}

      <Label htmlFor="documentos_otros">¿Tiene a la mano Otros Documentos Relevantes? ¿Cuáles?</Label>
      <Textarea
        id="documentos_otros"
        value={formData.documentos_otros || ''}
        onChange={(e) => handleStringChange('documentos_otros', e.target.value)}
        placeholder="Ej: Licencia de construcción, planos arquitectónicos, recibos de servicios públicos, etc."
      />
      {errors.documentos_otros && <p className="text-sm text-destructive">{errors.documentos_otros}</p>}
    </div>
  );
};

export default SectionGFields;