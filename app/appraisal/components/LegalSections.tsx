import React from 'react';
import { AppraisalFormData } from '../hooks/appraisalFormSchema';
// Import the new section components
import SectionBFields from './SectionBFields';
import SectionCFields from './SectionCFields';
import SectionDFields from './SectionDFields';
import SectionEFields from './SectionEFields';
import SectionFFields from './SectionFFields';
import SectionGFields from './SectionGFields';
import SectionHFields from './SectionHFields';
interface LegalSectionsProps {
  formData: AppraisalFormData;
  errors: Record<string, string>;
  handleStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleBooleanChange: (field: keyof AppraisalFormData, checked: boolean) => void;
  handleZonaDeclaratoriaChange: (field: 'aplica' | 'tipo' | 'restricciones_comunes_descripcion' | 'otras_restricciones_seleccion' | 'otras_restricciones_descripcion' | 'fuente', value: boolean | string | undefined) => void;
  handlePotRestrictionsChange: (value: string[]) => void; // Cambiado para aceptar string[]
  handleZonaDeclaratoriaRestriccionesChange: (restriction: string, checked: boolean) => void;
  handlePHBooleanChange: (field: keyof AppraisalFormData, value: boolean) => void;
  handlePHStringChange: (field: keyof AppraisalFormData, value: string) => void;
  handleLegalBooleanChange: (field: keyof AppraisalFormData['legal_declarations'], value: boolean) => void;
}

const LegalSections: React.FC<LegalSectionsProps> = ({
  formData,
  errors,
  handleStringChange,
  handleBooleanChange,
  handleZonaDeclaratoriaChange,
  handlePHBooleanChange,
  handlePHStringChange,
  handleLegalBooleanChange,
  handlePotRestrictionsChange,
  handleZonaDeclaratoriaRestriccionesChange,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Secciones Legales (Opcional)</h2>

      <SectionBFields
        formData={formData}
        errors={errors}
        handleBooleanChange={handlePHBooleanChange}
        handleStringChange={handlePHStringChange}
      />
      <SectionCFields
        formData={formData}
        errors={errors}
        handleStringChange={handleStringChange}
        handleBooleanChange={handleBooleanChange}
        handleZonaDeclaratoriaChange={handleZonaDeclaratoriaChange}
        handlePotRestrictionsChange={handlePotRestrictionsChange}
        handleZonaDeclaratoriaRestriccionesChange={handleZonaDeclaratoriaRestriccionesChange}
      />
      <SectionDFields
        formData={formData}
        errors={errors}
        handleStringChange={handleStringChange}
      />
      <SectionEFields />
      <SectionFFields
        formData={formData}
        errors={errors}
        handleStringChange={handleStringChange}
      />
      <SectionGFields
        formData={formData}
        errors={errors}
        handleBooleanChange={handleBooleanChange}
        handleStringChange={handleStringChange}
      />
      <SectionHFields
        formData={formData}
        errors={errors}
        handleLegalBooleanChange={handleLegalBooleanChange}
      />
    </div>
  );
};

export default LegalSections;