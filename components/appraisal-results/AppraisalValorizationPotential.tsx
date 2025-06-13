import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppraisalResult, MejoraConImpactoDetallado } from "@/app/appraisal/types/appraisal-results";

interface AppraisalValorizationPotentialProps {
  valorizationPotential: AppraisalResult['appraisal_data']['potencial_valorizacion_con_mejoras_explicado'];
}

export function AppraisalValorizationPotential({ valorizationPotential }: AppraisalValorizationPotentialProps) {
  if (!valorizationPotential) return null;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Potencial de Valorización con Mejoras</h2>
      {valorizationPotential.canon_potencial_total_estimado_cop && (
        <p>
          <strong>Canon Potencial Total Estimado (COP):</strong>{" "}
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valorizationPotential.canon_potencial_total_estimado_cop)}
        </p>
      )}
      {valorizationPotential.comentario_estrategia_valorizacion && (
        <p><strong>Comentario Estrategia:</strong> {valorizationPotential.comentario_estrategia_valorizacion}</p>
      )}
      {valorizationPotential.mejoras_con_impacto_detallado && valorizationPotential.mejoras_con_impacto_detallado.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-medium mb-2">Mejoras Detalladas:</h3>
          <Accordion type="single" collapsible className="w-full">
            {valorizationPotential.mejoras_con_impacto_detallado.map((mejoras: MejoraConImpactoDetallado, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left accordion-trigger">
                  {mejoras.recomendacion_tecnica_evaluada}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-2">
                    <p><strong>Justificación Técnica:</strong> {mejoras.justificacion_tecnica_original_relevancia}</p>
                    <p><strong>Incremento Estimado Canon (COP):</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(mejoras.incremento_estimado_canon_cop)}</p>
                    <p><strong>Justificación Económica:</strong> {mejoras.justificacion_estimacion_incremento_economico}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </Card>
  );
}