import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { AppraisalResult } from '@/app/appraisal/types/appraisal-results';

type ImprovementPotential = NonNullable<AppraisalResult['result_data']>['potencial_valorizacion_con_mejoras_explicado'];

interface ImprovementPotentialSectionProps {
  potential: ImprovementPotential;
}

export const ImprovementPotentialSection: React.FC<ImprovementPotentialSectionProps> = ({ potential }) => {
  if (!potential?.mejoras_con_impacto_detallado) return null;

  return (
    <AccordionItem value="improvement-potential" className="bg-white rounded-lg border">
      <AccordionTrigger className="px-4 text-lg font-semibold"><TrendingUp className="mr-2 h-5 w-5" /> Potencial de Mejoras</AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
         <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recomendación</TableHead>
                  <TableHead>Justificación</TableHead>
                  <TableHead className="text-right">Incremento Estimado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potential.mejoras_con_impacto_detallado.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.recomendacion_tecnica_evaluada}</TableCell>
                    <TableCell className="text-xs">{item.justificacion_estimacion_incremento_economico}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.incremento_estimado_canon_cop)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
      </AccordionContent>
    </AccordionItem>
  );
};