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

const LegalSections: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Secciones Legales (Opcional)</h2>

      <SectionBFields />
      <SectionCFields />
      <SectionDFields />
      <SectionEFields />
      <SectionFFields />
      <SectionGFields />
      <SectionHFields />
    </div>
  );
};

export default LegalSections;