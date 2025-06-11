import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LabelWithHint from "./LabelWithHint";
import { Checkbox } from "@/components/ui/checkbox";

interface SectionFFieldsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
}

const SectionFFields: React.FC<SectionFFieldsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
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

      {/* Nuevos campos para Servicios Públicos */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="serviciosConectadosFuncionando"
          checked={formData.serviciosConectadosFuncionando || false}
          onCheckedChange={(checked: boolean) => handleBooleanChange('serviciosConectadosFuncionando', checked)}
        />
        <LabelWithHint
          htmlFor="serviciosConectadosFuncionando"
          labelText="¿Todos los servicios públicos están conectados y funcionando?"
          hintText="Confirme si el inmueble cuenta con todos los servicios públicos (agua, luz, gas, alcantarillado) conectados y en correcto funcionamiento."
        />
      </div>
      {errors.serviciosConectadosFuncionando && <p className="text-sm text-destructive">{errors.serviciosConectadosFuncionando}</p>}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="deudasServiciosPublicos"
          checked={formData.deudasServiciosPublicos || false}
          onCheckedChange={(checked: boolean) => handleBooleanChange('deudasServiciosPublicos', checked)}
        />
        <LabelWithHint
          htmlFor="deudasServiciosPublicos"
          labelText="¿Existen deudas pendientes por servicios públicos?"
          hintText="Indique si hay facturas de servicios públicos sin pagar asociadas al inmueble."
        />
      </div>
      {errors.deudasServiciosPublicos && <p className="text-sm text-destructive">{errors.deudasServiciosPublicos}</p>}

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

      {/* Nuevos campos para Seguridad y Salubridad */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="cumpleNormasSismoresistencia"
          checked={formData.cumpleNormasSismoresistencia || false}
          onCheckedChange={(checked: boolean) => handleBooleanChange('cumpleNormasSismoresistencia', checked)}
        />
        <LabelWithHint
          htmlFor="cumpleNormasSismoresistencia"
          labelText="¿El inmueble cumple con las normas de sismoresistencia vigentes?"
          hintText="Confirme si la construcción del inmueble se adhiere a la normativa colombiana de sismoresistencia (NSR-10 o la que aplique), lo cual es crucial para la seguridad estructural."
        />
      </div>
      {errors.cumpleNormasSismoresistencia && <p className="text-sm text-destructive">{errors.cumpleNormasSismoresistencia}</p>}

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="riesgosEvidentesHabitabilidad"
            checked={formData.riesgosEvidentesHabitabilidad || false}
            onCheckedChange={(checked: boolean) => handleBooleanChange('riesgosEvidentesHabitabilidad', checked)}
          />
          <LabelWithHint
            htmlFor="riesgosEvidentesHabitabilidad"
            labelText="¿Existen riesgos evidentes que afecten la habitabilidad o seguridad?"
            hintText="Identifique cualquier riesgo visible como fallas estructurales, problemas eléctricos graves, inundaciones recurrentes, etc., que comprometan la habitabilidad o seguridad del inmueble."
          />
        </div>
        {errors.riesgosEvidentesHabitabilidad && <p className="text-sm text-destructive">{errors.riesgosEvidentesHabitabilidad}</p>}

        {formData.riesgosEvidentesHabitabilidad && (
          <div className="space-y-2 mt-2">
            <Label htmlFor="riesgosEvidentesHabitabilidadDescription">Describa los riesgos evidentes</Label>
            <Textarea
              id="riesgosEvidentesHabitabilidadDescription"
              value={formData.riesgosEvidentesHabitabilidadDescription || ''}
              onChange={(e) => handleStringChange('riesgosEvidentesHabitabilidadDescription', e.target.value)}
            />
            {errors.riesgosEvidentesHabitabilidadDescription && <p className="text-sm text-destructive">{errors.riesgosEvidentesHabitabilidadDescription}</p>}
          </div>
        )}
      </div>

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

      {/* Nuevo campo para Seguros */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cuentaPolizaSeguroVigente"
            checked={formData.cuentaPolizaSeguroVigente || false}
            onCheckedChange={(checked: boolean) => handleBooleanChange('cuentaPolizaSeguroVigente', checked)}
          />
          <LabelWithHint
            htmlFor="cuentaPolizaSeguroVigente"
            labelText="¿El inmueble cuenta con póliza de seguro vigente?"
            hintText="Indique si existe una póliza de seguro activa que cubra el inmueble contra riesgos como incendios, terremotos, etc."
          />
        </div>
        {errors.cuentaPolizaSeguroVigente && <p className="text-sm text-destructive">{errors.cuentaPolizaSeguroVigente}</p>}
      </div>
    </div>
  );
};

export default SectionFFields;