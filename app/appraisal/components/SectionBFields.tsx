import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // Import Select components
import { Switch } from "@/components/ui/switch"; // Import Switch

interface SectionBFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
}

const SectionBFields: React.FC<SectionBFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
}) => {
  return (
    <div className="space-y-4"> {/* Adjusted spacing */}
      <h3 className="text-lg font-medium">Sección B: Régimen de Propiedad Horizontal</h3>

      {/* Switch para ph_aplica con Hint */}
      <div className="space-y-2"> {/* Use space-y-2 for consistent spacing with LabelWithHint */}
        <LabelWithHint
          htmlFor="ph_aplica"
          labelText="¿Está el inmueble sometido al Régimen de Propiedad Horizontal?"
          hintText="Seleccione si el inmueble forma parte de un edificio o conjunto sometido al Régimen de Propiedad Horizontal (Ley 675 de 2001). Esto aplica comúnmente a apartamentos, oficinas, locales comerciales o casas dentro de conjuntos cerrados donde existen áreas comunes y normas de convivencia. Puede verificarlo en la escritura pública o el certificado de tradición y libertad del inmueble. Conocer esta información es crucial para el análisis legal y el avalúo."
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="ph_aplica"
            checked={formData.ph_aplica}
            onCheckedChange={(checked: boolean) => handleBooleanChange('ph_aplica', checked)}
          />
          {/* The main label is now part of LabelWithHint, but keep a visually hidden label for accessibility if needed, or rely on LabelWithHint's structure */}
          {/* <Label htmlFor="ph_aplica" className="sr-only">¿Está el inmueble sometido al Régimen de Propiedad Horizontal?</Label> */}
        </div>
        {errors.ph_aplica && <p className="text-sm text-destructive">{errors.ph_aplica}</p>}
      </div>


      {/* Renderizar el resto de los campos solo si ph_aplica es true */}
      {formData.ph_aplica && (
        <div className="space-y-4"> {/* Nested div for conditional rendering */}
          {/* Checkboxes para afirmaciones clave */}
          <div className="space-y-2">
            <LabelWithHint
              htmlFor="ph_afirmaciones"
              labelText="Afirmaciones sobre Propiedad Horizontal"
              hintText="Seleccione las afirmaciones que apliquen a su inmueble."
            />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ph_sometido_ley_675"
                  checked={formData.ph_sometido_ley_675}
                  onCheckedChange={(checked: boolean) => handleBooleanChange('ph_sometido_ley_675', checked)} // Explicitly type checked
                />
                <Label htmlFor="ph_sometido_ley_675">El inmueble está sometido al Régimen de Propiedad Horizontal (Ley 675 de 2001).</Label>
              </div>
              {errors.ph_sometido_ley_675 && <p className="text-sm text-destructive">{errors.ph_sometido_ley_675}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ph_reglamento_interno"
                  checked={formData.ph_reglamento_interno}
                  onCheckedChange={(checked: boolean) => handleBooleanChange('ph_reglamento_interno', checked)} // Explicitly type checked
                />
                <Label htmlFor="ph_reglamento_interno">Existe un reglamento interno que rige la administración y funcionamiento.</Label>
              </div>
              {errors.ph_reglamento_interno && <p className="text-sm text-destructive">{errors.ph_reglamento_interno}</p>}

               <div className="flex items-center space-x-2">
                <Checkbox
                  id="ph_reglamento_cubre_aspectos"
                  checked={formData.ph_reglamento_cubre_aspectos}
                  onCheckedChange={(checked: boolean) => handleBooleanChange('ph_reglamento_cubre_aspectos', checked)} // Explicitly type checked
                />
                <Label htmlFor="ph_reglamento_cubre_aspectos">El reglamento interno aborda derechos/deberes de copropietarios, uso de áreas comunes y estructura organizativa.</Label>
              </div>
              {errors.ph_reglamento_cubre_aspectos && <p className="text-sm text-destructive">{errors.ph_reglamento_cubre_aspectos}</p>}

               <div className="flex items-center space-x-2">
                <Checkbox
                  id="ph_escritura_registrada"
                  checked={formData.ph_escritura_registrada}
                  onCheckedChange={(checked: boolean) => handleBooleanChange('ph_escritura_registrada', checked)} // Explicitly type checked
                />
                <Label htmlFor="ph_escritura_registrada">El inmueble cuenta con escritura pública registrada.</Label>
              </div>
              {errors.ph_escritura_registrada && <p className="text-sm text-destructive">{errors.ph_escritura_registrada}</p>}
            </div>
          </div>

          {/* Select para Tipo de Propiedad en PH */}
          <div className="space-y-2">
            <Label htmlFor="ph_tipo_propiedad">Tipo de Propiedad en Propiedad Horizontal</Label>
            <Select
              onValueChange={(value) => handleStringChange('ph_tipo_propiedad', value)}
              value={formData.ph_tipo_propiedad || ''} // Use || '' for controlled component
            >
              <SelectTrigger id="ph_tipo_propiedad">
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residencial">Residencial</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Mixto">Mixto</SelectItem>
              </SelectContent>
            </Select>
            {errors.ph_tipo_propiedad && <p className="text-sm text-destructive">{errors.ph_tipo_propiedad}</p>}
          </div>


          {/* Mantener otros campos de la Sección B */}
          <Label htmlFor="ph_nombre_conjunto">Nombre del Conjunto/Edificio</Label>
          <Input
            id="ph_nombre_conjunto"
            value={formData.ph_nombre_conjunto || ''}
            onChange={(e) => handleStringChange('ph_nombre_conjunto', e.target.value)}
          />
          {errors.ph_nombre_conjunto && <p className="text-sm text-destructive">{errors.ph_nombre_conjunto}</p>}

          <LabelWithHint
            htmlFor="ph_nit_copropiedad"
            labelText="NIT de la Copropiedad"
            hintText="Número de Identificación Tributaria de la persona jurídica conformada por los propietarios de bienes privados en Propiedad Horizontal."
          />
          <Input
            id="ph_nit_copropiedad"
            value={formData.ph_nit_copropiedad || ''}
            onChange={(e) => handleStringChange('ph_nit_copropiedad', e.target.value)}
          />
          {errors.ph_nit_copropiedad && <p className="text-sm text-destructive">{errors.ph_nit_copropiedad}</p>}


          <Label htmlFor="ph_restriccion_arrendamiento">Restricciones para Arrendamiento</Label>
          <Textarea
            id="ph_restriccion_arrendamiento"
            value={formData.ph_restriccion_arrendamiento || ''}
            onChange={(e) => handleStringChange('ph_restriccion_arrendamiento', e.target.value)}
          />
          {errors.ph_restriccion_arrendamiento && <p className="text-sm text-destructive">{errors.ph_restriccion_arrendamiento}</p>}

          <Label htmlFor="ph_cuotas_pendientes">Cuotas de Administración Pendientes</Label>
          <Input
            id="ph_cuotas_pendientes"
            value={formData.ph_cuotas_pendientes || ''}
            onChange={(e) => handleStringChange('ph_cuotas_pendientes', e.target.value)}
          />
          {errors.ph_cuotas_pendientes && <p className="text-sm text-destructive">{errors.ph_cuotas_pendientes}</p>}

          <LabelWithHint
            htmlFor="ph_normativa_interna"
            labelText="Normativa Interna Relevante"
            hintText="Reglas o acuerdos internos del conjunto o edificio que afectan el uso o disfrute de los bienes privados y comunes."
          />
          <Textarea
            id="ph_normativa_interna"
            value={formData.ph_normativa_interna || ''}
            onChange={(e) => handleStringChange('ph_normativa_interna', e.target.value)}
          />
          {errors.ph_normativa_interna && <p className="text-sm text-destructive">{errors.ph_normativa_interna}</p>}
        </div>
      )} {/* End conditional rendering */}
    </div>
  );
};

export default SectionBFields;