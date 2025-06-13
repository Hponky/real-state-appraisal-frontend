import { Card } from "@/components/ui/card";
import { AppraisalResult, PuntoCritico, DocumentoClave } from "@/app/appraisal/types/appraisal-results";

interface AppraisalLegalAnalysisProps {
  legalAnalysis: AppraisalResult['appraisal_data']['analisis_legal_arrendamiento'];
}

export function AppraisalLegalAnalysis({ legalAnalysis }: AppraisalLegalAnalysisProps) {
  if (!legalAnalysis) return null;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Análisis Legal de Arrendamiento</h2>
      {legalAnalysis.tipo_uso_principal_analizado && (
        <p><strong>Tipo de Uso Principal Analizado:</strong> {legalAnalysis.tipo_uso_principal_analizado}</p>
      )}
      {legalAnalysis.viabilidad_general_preliminar && (
        <p><strong>Viabilidad General Preliminar:</strong> {legalAnalysis.viabilidad_general_preliminar}</p>
      )}
      {legalAnalysis.resumen_ejecutivo_legal && (
        <p><strong>Resumen Ejecutivo Legal:</strong> {legalAnalysis.resumen_ejecutivo_legal}</p>
      )}

      {legalAnalysis.puntos_criticos_y_riesgos && legalAnalysis.puntos_criticos_y_riesgos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-medium mb-2">Puntos Críticos y Riesgos:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {legalAnalysis.puntos_criticos_y_riesgos.map((punto: PuntoCritico, index: number) => (
              <li key={index}>{punto.descripcion_implicacion_riesgo}</li>
            ))}
          </ul>
        </div>
      )}

      {legalAnalysis.documentacion_clave_a_revisar_o_completar && legalAnalysis.documentacion_clave_a_revisar_o_completar.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-medium mb-2">Documentación Clave a Revisar o Completar:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {legalAnalysis.documentacion_clave_a_revisar_o_completar.map((doc: DocumentoClave, index: number) => (
              <li key={index}>{doc.documento}</li>
            ))}
          </ul>
        </div>
      )}

      {legalAnalysis.consideraciones_contractuales_sugeridas && legalAnalysis.consideraciones_contractuales_sugeridas.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-medium mb-2">Consideraciones Contractuales Sugeridas:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {legalAnalysis.consideraciones_contractuales_sugeridas.map((consideracion: string, index: number) => (
              <li key={index}>{consideracion}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}