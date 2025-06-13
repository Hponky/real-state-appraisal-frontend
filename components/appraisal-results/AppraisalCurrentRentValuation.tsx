import { Card } from "@/components/ui/card";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";

interface AppraisalCurrentRentValuationProps {
  currentRentValuation: AppraisalResult['appraisal_data']['valoracion_arriendo_actual'];
}

export function AppraisalCurrentRentValuation({ currentRentValuation }: AppraisalCurrentRentValuationProps) {
  if (!currentRentValuation) return null;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Valoración de Arriendo Actual</h2>
      {currentRentValuation.estimacion_canon_mensual_cop && (
        <p>
          <strong>Estimación Canon Mensual (COP):</strong>{" "}
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(currentRentValuation.estimacion_canon_mensual_cop)}
        </p>
      )}
      {currentRentValuation.justificacion_estimacion_actual && (
        <p><strong>Justificación:</strong> {currentRentValuation.justificacion_estimacion_actual}</p>
      )}
    </Card>
  );
}