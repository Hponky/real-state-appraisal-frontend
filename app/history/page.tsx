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
import { AppraisalResult, InformacionBasica, AnalisisMercado, ValoracionArriendoActual, PotencialValorizacionConMejorasExplicado } from "@/app/appraisal/types/appraisal-results";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AppraisalDetailModal from "@/components/AppraisalDetailModal";
import { useToast } from "@/hooks/use-toast";

type AppraisalHistoryItem = {
  id: string;
  userId: string;
  anonymousSessionId: string | null;
  appraisalData: string; // appraisalData es un string JSON
  createdAt: string;
};

type ParsedAppraisal = AppraisalResult & {
  id: string;
  createdAt: string;
};

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
            const appraisalResult: AppraisalResult = JSON.parse(item.appraisalData);
            return {
              ...appraisalResult,
              id: item.id,
              createdAt: item.createdAt,
              requestId: appraisalResult.requestId || item.id, // Asegurar que requestId esté presente
              gemini_usage_metadata: appraisalResult.gemini_usage_metadata || { // Asegurar que gemini_usage_metadata esté presente
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
                promptTokensDetails: [],
                thoughtsTokenCount: 0,
              },
            };
          } catch (e) {
            console.error("Error parsing appraisalData for item:", item.id, e);
            // Retornar un objeto con valores predeterminados para evitar errores de tipo
            return {
              id: item.id,
              createdAt: item.createdAt,
              requestId: item.id, // Asegurar que requestId esté presente
              informacion_basica: {
                requestId: item.id,
                ciudad: 'N/A',
                tipo_inmueble: 'N/A',
                estrato: 'N/A',
                area_usuario_m2: 0,
              },
              analisis_mercado: { // Proporcionar objeto vacío por defecto
                rango_arriendo_referencias_cop: { min: 0, max: 0 },
                observacion_mercado: 'N/A',
              },
              valoracion_arriendo_actual: { // Proporcionar objeto vacío por defecto
                estimacion_canon_mensual_cop: 0,
                justificacion_estimacion_actual: 'N/A',
              },
              potencial_valorizacion_con_mejoras_explicado: { // Proporcionar objeto vacío por defecto
                mejoras_con_impacto_detallado: [],
                canon_potencial_total_estimado_cop: 0,
                comentario_estrategia_valorizacion: 'N/A',
              },
              gemini_usage_metadata: { // Asegurar que gemini_usage_metadata esté presente
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
                promptTokensDetails: [],
                thoughtsTokenCount: 0,
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
    if (!appraisal.informacion_basica?.requestId || !session?.access_token) {
      console.error("No appraisal ID or auth token available for PDF download.");
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el PDF: ID de peritaje o token no disponible.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfBlob = await appraisalApiService.downloadPdf(appraisal, session.access_token);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peritaje-${appraisal.informacion_basica.requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Descarga exitosa",
        description: "El PDF se ha descargado correctamente.",
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

        <div className="mb-8">
          <Label htmlFor="dateFilter">Filtrar por fecha</Label>
          <Input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="max-w-xs"
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
                      ID de Solicitud: {appraisal.informacion_basica?.requestId || 'N/A'}
                    </p>
                    <div className="space-y-2">
                      <p>Ciudad: {appraisal.informacion_basica?.ciudad || 'N/A'}</p>
                      <p>Tipo de Inmueble: {appraisal.informacion_basica?.tipo_inmueble || 'N/A'}</p>
                      <p>Área: {appraisal.informacion_basica?.area_usuario_m2 || 'N/A'} m²</p>
                      {appraisal.valoracion_arriendo_actual?.estimacion_canon_mensual_cop && (
                        <p>
                          Canon Mensual Estimado:{" "}
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisal.valoracion_arriendo_actual.estimacion_canon_mensual_cop)}
                        </p>
                      )}
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
