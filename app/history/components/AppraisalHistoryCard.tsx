"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";

type ParsedAppraisal = {
  id: string;
  createdAt: string;
} & AppraisalResult;

interface AppraisalHistoryCardProps {
  appraisal: ParsedAppraisal;
  onCardClick: (appraisal: ParsedAppraisal) => void;
  onDownloadPdf: (appraisal: ParsedAppraisal) => void;
}

export const AppraisalHistoryCard = ({ appraisal, onCardClick, onDownloadPdf }: AppraisalHistoryCardProps) => {
  return (
    <Card key={appraisal.id} className="p-6 cursor-pointer" onClick={() => onCardClick(appraisal)}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Peritaje del {appraisal.createdAt ? format(new Date(appraisal.createdAt), 'dd/MM/yyyy HH:mm') : 'Fecha desconocida'}
          </h2>
          <p className="text-muted-foreground mb-4">
            ID de Solicitud: {appraisal.request_id || 'N/A'}
          </p>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm mt-4 border-t pt-4">
            <h3 className="col-span-2 text-lg font-semibold mb-2">Resumen del Peritaje</h3>
            
            <span className="font-medium">Ciudad:</span>
            <span>{appraisal.form_data?.ciudad || 'No disponible'}</span>

            <span className="font-medium">Dirección:</span>
            <span>{appraisal.form_data?.direccion || 'No disponible'}</span>

            <span className="font-medium">Tipo de Inmueble:</span>
            <span>{appraisal.form_data?.tipo_inmueble || 'No disponible'}</span>

            <span className="font-medium">Área Construida:</span>
            <span>{appraisal.form_data?.area_usuario_m2 ? `${appraisal.form_data.area_usuario_m2} m²` : 'No disponible'}</span>

            <span className="font-medium">Estrato:</span>
            <span>{appraisal.form_data?.estrato || 'No disponible'}</span>

            <span className="font-medium text-green-700">Canon Mensual Estimado:</span>
            <span className="font-bold text-green-700">
              {appraisal.result_data?.valoracion_arriendo_actual?.estimacion_canon_mensual_cop
                ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(appraisal.result_data.valoracion_arriendo_actual.estimacion_canon_mensual_cop)
                : 'No disponible'}
            </span>

            <span className="font-medium text-blue-700">Canon Potencial con Mejoras:</span>
            <span className="font-bold text-blue-700">
              {appraisal.result_data?.potencial_valorizacion_con_mejoras_explicado?.canon_potencial_total_estimado_cop
                ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(appraisal.result_data.potencial_valorizacion_con_mejoras_explicado.canon_potencial_total_estimado_cop)
                : 'No disponible'}
            </span>

            <span className="font-medium col-span-2 mt-2">Viabilidad Legal:</span>
            <p className="col-span-2 text-xs bg-gray-50 p-2 rounded">
              {appraisal.result_data?.analisis_legal_arrendamiento?.viabilidad_general_preliminar || 'No disponible'}
            </p>

            <span className="font-medium col-span-2 mt-2">Resumen Ejecutivo Legal:</span>
            <p className="col-span-2 text-xs bg-gray-50 p-2 rounded">
              {appraisal.result_data?.analisis_legal_arrendamiento?.resumen_ejecutivo_legal || 'No disponible'}
            </p>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDownloadPdf(appraisal);
          }}
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar PDF
        </Button>
      </div>
    </Card>
  );
};