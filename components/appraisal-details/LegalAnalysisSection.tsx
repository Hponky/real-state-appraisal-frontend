import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gavel } from "lucide-react";
import { getViabilityVariant } from '@/lib/utils';
import { AppraisalResult } from '@/app/appraisal/types/appraisal-results';

type LegalAnalysis = NonNullable<AppraisalResult['result_data']>['analisis_legal_arrendamiento'];

interface LegalAnalysisSectionProps {
  analysis: LegalAnalysis;
}

export const LegalAnalysisSection: React.FC<LegalAnalysisSectionProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <AccordionItem value="legal-analysis" className="bg-white rounded-lg border">
      <AccordionTrigger className="px-4 text-lg font-semibold"><Gavel className="mr-2 h-5 w-5" /> Análisis Legal</AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        <div className="pt-4">
          <p className="text-sm text-gray-500">Viabilidad General Preliminar</p>
          <Badge variant={getViabilityVariant(analysis.viabilidad_general_preliminar)} className="text-sm">
            {analysis.viabilidad_general_preliminar}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Resumen Ejecutivo</p>
          <p className="text-sm bg-gray-100 p-3 rounded-md">{analysis.resumen_ejecutivo_legal}</p>
        </div>

        {analysis.puntos_criticos_y_riesgos && (
          <div>
            <h4 className="font-semibold mb-2">Puntos Críticos y Riesgos</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aspecto Legal</TableHead>
                  <TableHead>Descripción del Riesgo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.puntos_criticos_y_riesgos.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.aspecto_legal_relevante}</TableCell>
                    <TableCell>{item.descripcion_implicacion_riesgo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};