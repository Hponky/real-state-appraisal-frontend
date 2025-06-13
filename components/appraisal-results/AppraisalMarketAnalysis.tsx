import { Card } from "@/components/ui/card";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";

interface AppraisalMarketAnalysisProps {
  marketAnalysis: AppraisalResult['appraisal_data']['analisis_mercado'];
}

export function AppraisalMarketAnalysis({ marketAnalysis }: AppraisalMarketAnalysisProps) {
  if (!marketAnalysis) return null;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Análisis de Mercado</h2>
      {marketAnalysis.rango_arriendo_referencias_cop && (
        <p>
          <strong>Rango de Arriendo (COP):</strong>{" "}
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(marketAnalysis.rango_arriendo_referencias_cop.min)} -{" "}
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(marketAnalysis.rango_arriendo_referencias_cop.max)}
        </p>
      )}
      {marketAnalysis.observacion_mercado && (
        <p><strong>Observación del Mercado:</strong> {marketAnalysis.observacion_mercado}</p>
      )}
    </Card>
  );
}