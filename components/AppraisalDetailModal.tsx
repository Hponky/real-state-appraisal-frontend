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
  const formatValue = (key: string, value: any) => {
    if (key === 'area_usuario_m2' && typeof value === 'number') {
      return `${value} m²`;
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return String(value || 'N/A');
  };

  const renderDetail = (key: string, value: any) => {
    const formattedValue = formatValue(key, value);
    if (key === 'factores_positivos_potencial' || key === 'factores_negativos_potencial') {
      if (Array.isArray(value)) {
        return (
          <div key={key} className="text-sm">
            <span className="font-medium">{formatKey(key)}:</span>
            <ul className="list-disc list-inside ml-4">
              {value.map((item, index) => (
                <li key={index} className="whitespace-pre-wrap">{item}</li>
              ))}
            </ul>
          </div>
        );
      }
      return (
        <div key={key} className="text-sm">
          <span className="font-medium">{formatKey(key)}:</span>
          <div className="whitespace-pre-wrap">{String(value || 'N/A')}</div>
        </div>
      );
    }
    return (
      <p key={key} className="text-sm">
        <span className="font-medium">{formatKey(key)}:</span> {formattedValue}
      </p>
    );
  };

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

                if (key === 'analisis_cualitativo_arriendo' && typeof value === 'object' && value !== null) {
                  return (
                    <div key={key} className="mb-3">
                      <p className="font-semibold text-md mb-1">{formatKey(key)}:</p>
                      <Card className="ml-4 border-l-2 pl-4">
                        <CardContent className="pt-4">
                          {Object.entries(value).map(([subKey, subValue]) => {
                            if (subKey === 'factores_positivos_potencial' || subKey === 'factores_negativos_potencial') {
                              return (
                                <div key={subKey} className="mb-3">
                                  <p className="font-semibold text-sm mb-1">{formatKey(subKey)}:</p>
                                  {Array.isArray(subValue) ? (
                                    <ul className="list-disc list-inside ml-4">
                                      {subValue.map((item, index) => (
                                        <li key={index} className="whitespace-pre-wrap text-sm">{item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="whitespace-pre-wrap text-sm">{String(subValue || 'N/A')}</div>
                                  )}
                                </div>
                              );
                            }
                            return renderDetail(subKey, subValue);
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  );
                }

                if (typeof value === 'object' && value !== null) {
                  if (Array.isArray(value)) {
                    // Check if it's an array of strings (like factores_positivos_potencial or recomendaciones_proximos_pasos)
                    if (value.length > 0 && typeof value[0] === 'string') {
                      return (
                        <div key={key} className="mb-3">
                          <p className="font-semibold text-md mb-1">{formatKey(key)}:</p>
                          <ul className="list-disc list-inside ml-4">
                            {value.map((item: string, index: number) => (
                              <li key={index} className="whitespace-pre-wrap">{item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    } else {
                      // Existing logic for arrays of objects
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
                  }
                  // Existing logic for objects that are not arrays
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
            Información completa del peritaje con ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{appraisal.request_id || appraisal.id}</span>
          </DialogDescription>
          <p className="text-sm text-gray-600 mt-2">
            Dirección: <span className="font-medium">{appraisal?.initial_data?.address ?? 'Dirección no disponible'}</span>
          </p>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <p className="text-sm text-gray-500">
            Fecha de Creación: <span className="font-medium">{appraisal.createdAt ? format(new Date(appraisal.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
          </p>

          <Accordion type="multiple" className="w-full">
            {renderSection("Información Básica", appraisal.initial_data ?? {}, "basic-info")}
            {renderSection("Análisis de Mercado", appraisal.appraisal_data?.analisis_mercado ?? {}, "market-analysis")}
            {renderSection("Valoración de Arriendo Actual", appraisal.appraisal_data?.valoracion_arriendo_actual ?? {}, "current-rent-valuation")}
            {renderSection("Potencial de Valorización con Mejoras", appraisal.appraisal_data?.potencial_valorizacion_con_mejoras_explicado ?? {}, "improvement-potential")}
            {renderSection("Análisis Cualitativo de Arriendo", (appraisal as any).analisis_cualitativo_arriendo ?? {}, "qualitative-rent-analysis")}
            {renderSection("Análisis Legal de Arrendamiento", appraisal.appraisal_data?.analisis_legal_arrendamiento ?? {}, "legal-analysis")}
            {(appraisal.appraisal_data?.analisis_legal_arrendamiento?.consideraciones_contractuales_sugeridas ?? []).length > 0 && (
              <AccordionItem value="next-steps-recommendations">
                <AccordionTrigger className="text-lg font-semibold">Recomendaciones y Próximos Pasos</AccordionTrigger>
                <AccordionContent>
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      <ul className="list-disc list-inside ml-4">
                        {(appraisal.appraisal_data?.analisis_legal_arrendamiento?.consideraciones_contractuales_sugeridas ?? []).map((item, index) => (
                          <li key={index} className="whitespace-pre-wrap">{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            )}
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
