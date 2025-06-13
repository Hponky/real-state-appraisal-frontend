"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AppraisalDetailModal from "@/components/AppraisalDetailModal";
import { useToast } from "@/hooks/use-toast";

type AppraisalHistoryItem = {
  id: string;
  userId: string;
  anonymousSessionId: string | null;
  appraisalData: string; // appraisalData es un string JSON
  createdAt: string;
  requestId: string; // Add requestId as it's present in the raw data
};

type ParsedAppraisal = {
  id: string;
  createdAt: string;
} & AppraisalResult;

export default function History() {
  const [appraisals, setAppraisals] = useState<ParsedAppraisal[]>([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState<ParsedAppraisal[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<ParsedAppraisal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppraisals = async () => {
      if (isAuthLoading) return; // Esperar a que la autenticación termine de cargar

      if (!user || !session?.access_token) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para ver tu historial de peritajes.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const data: AppraisalHistoryItem[] = await appraisalApiService.getAppraisalHistory(session.access_token);
        const parsedData: ParsedAppraisal[] = data.map(item => {
          try {
            const rawAppraisalContent = JSON.parse(item.appraisalData);

            // Construct an object that fully conforms to AppraisalResult
            const appraisalResult: AppraisalResult = {
              request_id: item.requestId, // Use requestId from AppraisalHistoryItem
              user_id: user?.id || '', // Ensure user_id is present
              created_at: item.createdAt, // Ensure created_at is present
              initial_data: rawAppraisalContent.initial_data || { // Provide default if missing from raw content
                ciudad: rawAppraisalContent.initial_data?.ciudad || 'N/A',
                address: rawAppraisalContent.initial_data?.address || 'N/A',
                area_usuario_m2: rawAppraisalContent.initial_data?.area_usuario_m2 || 0,
                tipo_inmueble: rawAppraisalContent.initial_data?.tipo_inmueble || 'N/A',
                estrato: rawAppraisalContent.initial_data?.estrato || 'N/A',
              },
              appraisal_data: {
                analisis_mercado: rawAppraisalContent.analisis_mercado || { rango_arriendo_referencias_cop: { min: 0, max: 0 }, observacion_mercado: 'N/A' },
                valoracion_arriendo_actual: rawAppraisalContent.valoracion_arriendo_actual || { estimacion_canon_mensual_cop: 0, justificacion_estimacion_actual: 'N/A' },
                potencial_valorizacion_con_mejoras_explicado: rawAppraisalContent.potencial_valorizacion_con_mejoras_explicado || { mejoras_con_impacto_detallado: [], canon_potencial_total_estimado_cop: 0, comentario_estrategia_valorizacion: 'N/A' },
                analisis_legal_arrendamiento: rawAppraisalContent.analisis_legal_arrendamiento || {
                  requestId: item.requestId, // Use item.requestId here
                  tipo_uso_principal_analizado: 'N/A',
                  viabilidad_general_preliminar: 'N/A',
                  puntos_criticos_y_riesgos: [],
                  documentacion_clave_a_revisar_o_completar: [],
                  consideraciones_contractuales_sugeridas: [],
                  resumen_ejecutivo_legal: 'N/A',
                },
                gemini_usage_metadata: rawAppraisalContent.gemini_usage_metadata || {
                  economico: {
                    promptTokenCount: 0,
                    candidatesTokenCount: 0,
                    totalTokenCount: 0,
                    promptTokensDetails: [],
                    thoughtsTokenCount: 0,
                  },
                },
              },
            };

            // Now, construct ParsedAppraisal
            return {
              id: item.id,
              createdAt: item.createdAt,
              ...appraisalResult, // Spread the correctly formed AppraisalResult
            };
          } catch (e) {
            console.error("Error parsing appraisalData for item:", item.id, e);
            // Fallback for parsing errors, ensuring a valid ParsedAppraisal object is returned
            return {
              id: item.id,
              createdAt: item.createdAt,
              request_id: item.requestId || item.id, // Use item.requestId, fallback to item.id
              user_id: user?.id || '',
              created_at: item.createdAt,
              initial_data: {
                ciudad: 'N/A',
                address: 'N/A',
                area_usuario_m2: 0,
                tipo_inmueble: 'N/A',
                estrato: 'N/A',
              },
              appraisal_data: {
                analisis_mercado: {
                  rango_arriendo_referencias_cop: { min: 0, max: 0 },
                  observacion_mercado: 'N/A',
                },
                valoracion_arriendo_actual: {
                  estimacion_canon_mensual_cop: 0,
                  justificacion_estimacion_actual: 'N/A',
                },
                potencial_valorizacion_con_mejoras_explicado: {
                  mejoras_con_impacto_detallado: [],
                  canon_potencial_total_estimado_cop: 0,
                  comentario_estrategia_valorizacion: 'N/A',
                },
                analisis_legal_arrendamiento: {
                  requestId: item.requestId || item.id,
                  tipo_uso_principal_analizado: 'N/A',
                  viabilidad_general_preliminar: 'N/A',
                  puntos_criticos_y_riesgos: [],
                  documentacion_clave_a_revisar_o_completar: [],
                  consideraciones_contractuales_sugeridas: [],
                  resumen_ejecutivo_legal: 'N/A',
                },
                gemini_usage_metadata: {
                  economico: {
                    promptTokenCount: 0,
                    candidatesTokenCount: 0,
                    totalTokenCount: 0,
                    promptTokensDetails: [],
                    thoughtsTokenCount: 0,
                  },
                },
              },
            };
          }
        });
        setAppraisals(parsedData);
        setFilteredAppraisals(parsedData);
      } catch (err: any) {
        console.error('Error fetching appraisals:', err);
        toast({
          title: "Error al cargar historial",
          description: err.message || "Ocurrió un error al cargar el historial de peritajes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, [user, session, isAuthLoading]);

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    if (!date) {
      setFilteredAppraisals(appraisals);
    } else {
      const filtered = appraisals.filter(appraisal => {
        const appraisalDate = appraisal.createdAt ? format(new Date(appraisal.createdAt), 'yyyy-MM-dd') : null;
        return appraisalDate === date;
      });
      setFilteredAppraisals(filtered);
    }
  };

  const handleDownloadPDF = async (appraisal: ParsedAppraisal) => {
    if (!appraisal.request_id || !session?.access_token) {
      console.error("No appraisal ID or auth token available for PDF download.");
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el PDF: ID de peritaje o token no disponible.",
        variant: "destructive",
      });
      return;
    }

    try {
      await appraisalApiService.downloadPdf(appraisal.id, session.access_token);
      toast({
        title: "Descarga iniciada",
        description: "El PDF debería comenzar a descargarse en breve.",
      });
    } catch (err: any) {
      console.error("Error downloading PDF from backend:", err);
      toast({
        title: "Error de descarga",
        description: err.message || "Error al descargar el PDF desde el servidor.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (appraisal: ParsedAppraisal) => {
    setSelectedAppraisal(appraisal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppraisal(null);
  };

  if (loading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando historial...</p>
      </div>
    );
  }


  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Por favor, inicia sesión para ver tu historial.</p>
        <Link href="/auth" className="inline-flex items-center text-primary mt-4">
          Iniciar Sesión / Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Historial de Peritajes</h1>

        <div className="mb-8 flex items-center gap-4">
          <Label htmlFor="dateFilter" className="flex-shrink-0">Filtrar por fecha:</Label>
          <Input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="max-w-xs w-full"
          />
        </div>

        <div className="grid gap-6">
          {filteredAppraisals.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay peritajes guardados en tu historial.</p>
          ) : (
            filteredAppraisals.map((appraisal) => (
              <Card key={appraisal.id} className="p-6 cursor-pointer" onClick={() => handleCardClick(appraisal)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Peritaje del {appraisal.createdAt ? format(new Date(appraisal.createdAt), 'dd/MM/yyyy HH:mm') : 'Fecha desconocida'}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      ID de Solicitud: {appraisal.request_id || 'N/A'}
                    </p>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                      <span className="font-medium">Ciudad:</span> <span>{appraisal.initial_data?.ciudad || 'N/A'}</span>
                      <span className="font-medium">Tipo de Inmueble:</span> <span>{appraisal.initial_data?.tipo_inmueble || 'N/A'}</span>
                      <span className="font-medium">Área:</span> <span>{appraisal.initial_data?.area_usuario_m2 > 0 ? `${appraisal.initial_data.area_usuario_m2} m²` : 'N/A m²'}</span>
                      <>
                        <span className="font-medium">Canon Mensual Estimado:</span>
                        <span>
                          {appraisal.appraisal_data?.valoracion_arriendo_actual?.estimacion_canon_mensual_cop !== undefined && appraisal.appraisal_data.valoracion_arriendo_actual.estimacion_canon_mensual_cop !== null
                            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisal.appraisal_data.valoracion_arriendo_actual.estimacion_canon_mensual_cop)
                            : 'N/A'}
                        </span>
                      </>
                      <>
                        <span className="font-medium">Consideraciones Legales:</span>
                        <span>
                          {appraisal.appraisal_data?.analisis_legal_arrendamiento?.consideraciones_contractuales_sugeridas?.length > 0
                            ? appraisal.appraisal_data.analisis_legal_arrendamiento.consideraciones_contractuales_sugeridas.join(', ')
                            : 'N/A'}
                        </span>
                      </>
                      <>
                        <span className="font-medium">Resumen Legal Ejecutivo:</span>
                        <span>
                          {appraisal.appraisal_data?.analisis_legal_arrendamiento?.resumen_ejecutivo_legal || 'N/A'}
                        </span>
                      </>
                      <>
                        <span className="font-medium">Canon Potencial con Mejoras:</span>
                        <span>
                          {appraisal.appraisal_data?.potencial_valorizacion_con_mejoras_explicado?.canon_potencial_total_estimado_cop !== undefined && appraisal.appraisal_data.potencial_valorizacion_con_mejoras_explicado.canon_potencial_total_estimado_cop !== null
                            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisal.appraisal_data.potencial_valorizacion_con_mejoras_explicado.canon_potencial_total_estimado_cop)
                            : 'N/A'}
                        </span>
                      </>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que el clic en el botón propague al Card
                      handleDownloadPDF(appraisal);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </motion.div>

      {selectedAppraisal && (
        <AppraisalDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          appraisal={selectedAppraisal}
          onDownloadPdf={handleDownloadPDF}
        />
      )}
    </div>
  );
}
