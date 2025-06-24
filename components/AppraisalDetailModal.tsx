import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Home, Gavel, TrendingUp, BarChart2 } from "lucide-react";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, getViabilityVariant } from '@/lib/utils';
import { LegalAnalysisSection } from './appraisal-details/LegalAnalysisSection';
import { ImprovementPotentialSection } from './appraisal-details/ImprovementPotentialSection';
import { MarketAnalysisSection } from './appraisal-details/MarketAnalysisSection';
import { PropertyInfoSection } from './appraisal-details/PropertyInfoSection';

type ParsedAppraisal = AppraisalResult & {
  id: string;
  createdAt: string;
};

interface AppraisalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appraisal: ParsedAppraisal;
  onDownloadPdf: (appraisal: ParsedAppraisal) => void;
}

const AppraisalDetailModal: React.FC<AppraisalDetailModalProps> = ({ isOpen, onClose, appraisal, onDownloadPdf }) => {
  if (!appraisal) return null;

  const { form_data, result_data } = appraisal;
  const {
    analisis_mercado,
    valoracion_arriendo_actual,
    potencial_valorizacion_con_mejoras_explicado,
    analisis_legal_arrendamiento
  } = result_data ?? {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-6 bg-gray-50">
        <DialogHeader className="pb-4 border-b text-left">
          <DialogTitle className="text-2xl font-bold text-gray-800">Detalles del Peritaje</DialogTitle>
          <DialogDescription className="text-gray-600">
            ID: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{appraisal.request_id || appraisal.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-800">Canon Mensual Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(valoracion_arriendo_actual?.estimacion_canon_mensual_cop ?? 0)}
                </p>
                <p className="text-xs text-gray-600 mt-2">{valoracion_arriendo_actual?.justificacion_estimacion_actual}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-800">Canon Potencial con Mejoras</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(potencial_valorizacion_con_mejoras_explicado?.canon_potencial_total_estimado_cop ?? 0)}
                </p>
                 <p className="text-xs text-gray-600 mt-2">{potencial_valorizacion_con_mejoras_explicado?.comentario_estrategia_valorizacion}</p>
              </CardContent>
            </Card>
          </div>

          <Accordion type="multiple" className="w-full space-y-4">
            {/* Basic Info */}
            <PropertyInfoSection data={form_data} />

            {/* Legal Analysis */}
            {analisis_legal_arrendamiento && <LegalAnalysisSection analysis={analisis_legal_arrendamiento} />}

            {/* Improvement Potential */}
            {potencial_valorizacion_con_mejoras_explicado && <ImprovementPotentialSection potential={potencial_valorizacion_con_mejoras_explicado} />}
            
            {/* Market Analysis */}
            {analisis_mercado && <MarketAnalysisSection analysis={analisis_mercado} />}

          </Accordion>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t">
          <Button onClick={() => onDownloadPdf(appraisal)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Descargar Informe PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppraisalDetailModal;
