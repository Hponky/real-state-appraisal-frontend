import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart2 } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { AppraisalResult } from '@/app/appraisal/types/appraisal-results';

type MarketAnalysis = NonNullable<AppraisalResult['result_data']>['analisis_mercado'];

interface MarketAnalysisSectionProps {
  analysis: MarketAnalysis;
}

export const MarketAnalysisSection: React.FC<MarketAnalysisSectionProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <AccordionItem value="market-analysis" className="bg-white rounded-lg border">
      <AccordionTrigger className="px-4 text-lg font-semibold"><BarChart2 className="mr-2 h-5 w-5" /> Análisis de Mercado</AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
          <div className="pt-4">
              <p className="text-sm text-gray-500">Rango de Arriendo de Referencia</p>
              <p className="font-semibold">{formatCurrency(analysis.rango_arriendo_referencias_cop.min)} - {formatCurrency(analysis.rango_arriendo_referencias_cop.max)}</p>
          </div>
          <div>
              <p className="text-sm text-gray-500">Observación del Mercado</p>
              <p className="text-sm bg-gray-100 p-3 rounded-md">{analysis.observacion_mercado}</p>
          </div>
      </AccordionContent>
    </AccordionItem>
  );
};