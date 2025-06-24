import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home } from "lucide-react";
import { AppraisalResult } from '@/app/appraisal/types/appraisal-results';

type FormData = AppraisalResult['form_data'];

interface PropertyInfoSectionProps {
  data: FormData;
}

export const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({ data }) => {
  if (!data) return null;

  return (
    <AccordionItem value="basic-info" className="bg-white rounded-lg border">
      <AccordionTrigger className="px-4 text-lg font-semibold"><Home className="mr-2 h-5 w-5" /> Información del Inmueble</AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          <div><p className="text-sm text-gray-500">Ciudad</p><p className="font-semibold">{data.ciudad}</p></div>
          <div><p className="text-sm text-gray-500">Dirección</p><p className="font-semibold">{data.direccion ?? 'N/A'}</p></div>
          <div><p className="text-sm text-gray-500">Tipo de Inmueble</p><p className="font-semibold">{data.tipo_inmueble}</p></div>
          <div><p className="text-sm text-gray-500">Estrato</p><p className="font-semibold">{data.estrato}</p></div>
          <div><p className="text-sm text-gray-500">Área (m²)</p><p className="font-semibold">{data.area_usuario_m2}</p></div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};