import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return String(value || 'N/A');
  };

  const renderDetail = (key: string, value: any) => (
    <p key={key} className="text-sm">
      <span className="font-medium">{formatKey(key)}:</span> {formatValue(value)}
    </p>
  );

  const renderSection = (title: string, data: any, sectionKey: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <AccordionItem value={sectionKey}>
        <AccordionTrigger className="text-lg font-semibold">{title}</AccordionTrigger>
        <AccordionContent>
          <Card className="mt-2">
            <CardContent className="pt-4">
              {Object.entries(data).map(([key, value]) => {
                if (key === 'requestId' || key === 'gemini_usage_metadata') return null;

                if (typeof value === 'object' && value !== null) {
                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="mb-3">
                        <p className="font-semibold text-md mb-1">{formatKey(key)}:</p>
                        {value.map((item, index) => (
                          <Card key={index} className="mb-2 ml-4 border-l-2 pl-4">
                            <CardContent className="pt-4">
                              {Object.entries(item).map(([subKey, subValue]) => renderDetail(subKey, subValue))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="mb-3">
                      <p className="font-semibold text-md mb-1">{formatKey(key)}:</p>
                      <Card className="ml-4 border-l-2 pl-4">
                        <CardContent className="pt-4">
                          {Object.entries(value).map(([subKey, subValue]) => renderDetail(subKey, subValue))}
                        </CardContent>
                      </Card>
                    </div>
                  );
                }
                return renderDetail(key, value);
              })}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-800">Detalles del Peritaje</DialogTitle>
          <DialogDescription className="text-gray-600">
            Información completa del peritaje con ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{appraisal.informacion_basica?.requestId || appraisal.id}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <p className="text-sm text-gray-500">
            Fecha de Creación: <span className="font-medium">{appraisal.createdAt ? format(new Date(appraisal.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
          </p>

          <Accordion type="multiple" className="w-full">
            {renderSection("Información Básica", appraisal.informacion_basica, "basic-info")}
            {renderSection("Análisis de Mercado", appraisal.analisis_mercado, "market-analysis")}
            {renderSection("Valoración de Arriendo Actual", appraisal.valoracion_arriendo_actual, "current-rent-valuation")}
            {renderSection("Potencial de Valorización con Mejoras", appraisal.potencial_valorizacion_con_mejoras_explicado, "improvement-potential")}
            {renderSection("Análisis Cualitativo de Arriendo", appraisal.analisis_cualitativo_arriendo, "qualitative-rent-analysis")}
            {renderSection("Recomendaciones y Próximos Pasos", appraisal.recomendaciones_proximos_pasos, "next-steps-recommendations")}
          </Accordion>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onDownloadPdf(appraisal)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppraisalDetailModal;