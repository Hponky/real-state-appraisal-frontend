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
import AppraisalDetailModal from "@/components/AppraisalDetailModal";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/components/supabase-provider";

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
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppraisals = async () => {
      if (isAuthLoading) return;
      setLoading(true);

      try {
        let data: any[] = [];
        if (user && session?.access_token) {
          // Usuario autenticado
          data = await appraisalApiService.getAppraisalHistory(session.access_token);
        } else {
          // Usuario anónimo
          const anonymousSessionId = localStorage.getItem('anonymous_session_id');
          if (anonymousSessionId) {
            if (supabase) {
              data = await appraisalApiService.getAnonymousAppraisals(supabase, anonymousSessionId);
            }
          }
        }
        
        // La lógica de parseo es compleja y se puede reutilizar para ambos casos
        const parsedData: ParsedAppraisal[] = data.map(item => {
          try {
            // Los datos ahora vienen como objetos, no es necesario el parseo.
            const formDataRaw = item.formData || {};
            const resultDataRaw = item.resultData || {};

            // Normalizar la estructura de form_data
            const infoBasica = formDataRaw.informacion_basica || formDataRaw;
            const finalFormData = {
              ...formDataRaw,
              ...infoBasica,
            };
            
            // Normalizar la estructura de result_data
            const finalResultData = resultDataRaw.result_data || resultDataRaw;

            const appraisalResult: AppraisalResult = {
              id: item.id,
              request_id: finalFormData.requestId || item.id,
              user_id: item.userId,
              created_at: item.createdAt,
              form_data: finalFormData,
              result_data: finalResultData,
              status: item.status,
            };

            return {
              createdAt: item.createdAt,
              ...appraisalResult,
            };
          } catch (e) {
            console.error("Error parsing data for item:", item.id, e);
            return null;
          }
        }).filter((item): item is ParsedAppraisal => item !== null);

        setAppraisals(parsedData);
        setFilteredAppraisals(parsedData);

      } catch (err: any) {
        console.error('Error fetching appraisals:', err);
        toast({
          title: "Error al cargar historial",
          description: err.message || "Ocurrió un error al cargar el historial.",
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
      await appraisalApiService.downloadPdf(appraisal.request_id, session.access_token);
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


  if (!user && appraisals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No tienes peritajes en tu historial.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Puedes <Link href="/auth" className="text-primary hover:underline">iniciar sesión</Link> para ver tu historial guardado o realizar un nuevo peritaje.
        </p>
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
