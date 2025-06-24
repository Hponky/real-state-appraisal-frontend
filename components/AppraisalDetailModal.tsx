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

// Helper to format currency
const formatCurrency = (value: number) => {
  if (isNaN(value) || value === null) return "N/A";
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Helper to get badge variant based on viability
const getViabilityVariant = (viability: string = ""): "default" | "destructive" | "secondary" => {
  const lowerCaseViability = viability.toLowerCase();
  if (lowerCaseViability.includes("crítico") || lowerCaseViability.includes("no recomendable")) {
    return "destructive";
  }
  if (lowerCaseViability.includes("viable con") || lowerCaseViability.includes("moderado")) {
    return "secondary";
  }
  if (lowerCaseViability.includes("viable")) {
    return "default";
  }
  return "secondary";
};


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
            <AccordionItem value="basic-info" className="bg-white rounded-lg border">
              <AccordionTrigger className="px-4 text-lg font-semibold"><Home className="mr-2 h-5 w-5" /> Información del Inmueble</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  <div><p className="text-sm text-gray-500">Ciudad</p><p className="font-semibold">{form_data?.ciudad}</p></div>
                  <div><p className="text-sm text-gray-500">Dirección</p><p className="font-semibold">{form_data?.direccion ?? 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Tipo de Inmueble</p><p className="font-semibold">{form_data?.tipo_inmueble}</p></div>
                  <div><p className="text-sm text-gray-500">Estrato</p><p className="font-semibold">{form_data?.estrato}</p></div>
                  <div><p className="text-sm text-gray-500">Área (m²)</p><p className="font-semibold">{form_data?.area_usuario_m2}</p></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Legal Analysis */}
            {analisis_legal_arrendamiento && (
              <AccordionItem value="legal-analysis" className="bg-white rounded-lg border">
                <AccordionTrigger className="px-4 text-lg font-semibold"><Gavel className="mr-2 h-5 w-5" /> Análisis Legal</AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">Viabilidad General Preliminar</p>
                    <Badge variant={getViabilityVariant(analisis_legal_arrendamiento.viabilidad_general_preliminar)} className="text-sm">
                      {analisis_legal_arrendamiento.viabilidad_general_preliminar}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Resumen Ejecutivo</p>
                    <p className="text-sm bg-gray-100 p-3 rounded-md">{analisis_legal_arrendamiento.resumen_ejecutivo_legal}</p>
                  </div>

                  {analisis_legal_arrendamiento.puntos_criticos_y_riesgos && (
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
                          {analisis_legal_arrendamiento.puntos_criticos_y_riesgos.map((item, index) => (
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
            )}

            {/* Improvement Potential */}
            {potencial_valorizacion_con_mejoras_explicado?.mejoras_con_impacto_detallado && (
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
                          {potencial_valorizacion_con_mejoras_explicado.mejoras_con_impacto_detallado.map((item, index) => (
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
            )}
            
            {/* Market Analysis */}
            {analisis_mercado && (
              <AccordionItem value="market-analysis" className="bg-white rounded-lg border">
                <AccordionTrigger className="px-4 text-lg font-semibold"><BarChart2 className="mr-2 h-5 w-5" /> Análisis de Mercado</AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="pt-4">
                        <p className="text-sm text-gray-500">Rango de Arriendo de Referencia</p>
                        <p className="font-semibold">{formatCurrency(analisis_mercado.rango_arriendo_referencias_cop.min)} - {formatCurrency(analisis_mercado.rango_arriendo_referencias_cop.max)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Observación del Mercado</p>
                        <p className="text-sm bg-gray-100 p-3 rounded-md">{analisis_mercado.observacion_mercado}</p>
                    </div>
                </AccordionContent>
              </AccordionItem>
            )}

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
