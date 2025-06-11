"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, History, Download, Save } from "lucide-react";
import { motion } from "framer-motion";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/hooks/useAuth";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function Results() {
  const [appraisalData, setAppraisalData] = useState<AppraisalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySavedModal, setShowAlreadySavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, session } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    if (!appraisalData?.informacion_basica?.requestId) {
      console.error("No appraisal ID available for PDF download.");
      return;
    }

    if (user && user.email && session?.access_token) {
      try {
        const pdfBlob = await appraisalApiService.downloadPdf(appraisalData, session.access_token);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados-peritaje-${appraisalData.informacion_basica.requestId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.error("Error downloading PDF from backend (authenticated):", err);
        setError("Error al descargar el PDF desde el servidor. Intentando descarga local...");
      }
    } else {
      console.error("User not authenticated with email. Cannot download PDF from backend.");
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para descargar el PDF.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAppraisal = async () => {
    if (!user || !user.email || !session?.access_token) {
      setShowLoginModal(true);
      return;
    }
    if (!appraisalData?.informacion_basica?.requestId) {
      console.error("No appraisal data to save.");
      toast({
        title: "Error",
        description: "No hay datos de peritaje para guardar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await appraisalApiService.saveAppraisalResult(
        appraisalData,
        user?.id || null,
        session.access_token
      );
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error saving appraisal:", err);
      if (err.message && err.message.includes('CONFLICT')) {
        setShowAlreadySavedModal(true);
      } else {
        toast({
          title: "Error al guardar",
          description: "Hubo un problema al guardar el resultado. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id');

    if (!requestId) {
      setError("No appraisal request ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/appraisal/status?id=${requestId}`, {
          credentials: 'include',
        });
        const result = await response.json();

        if (response.ok && result.status === 'completed') {
          if (result.results) {
            setAppraisalData(result.results.initial_data);
          } else {
            setError("Invalid appraisal results format or missing initial data.");
          }
        } else if (response.status === 202) {
          setError("Appraisal is still pending. Please wait or try refreshing.");
        } else {
          setError(result.error || 'Failed to fetch appraisal results.');
          console.error("Error fetching appraisal results:", result);
        }
      } catch (error) {
        console.error("Error during fetch results:", error);
        let errorMessage = 'Failed to load appraisal results.';
        if (error instanceof Error) errorMessage = error.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  useEffect(() => {
    if (!user?.email && !loading && !error && appraisalData) {
      setShowLoginModal(true);
    }
  }, [user, loading, error, appraisalData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Cargando resultados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Error al cargar los resultados: {error}</p>
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (!appraisalData) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No se encontraron datos de peritaje.</p>
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
        <div className="space-x-4">
          {user?.email && (
            <Button
              variant="outline"
              className="inline-flex items-center"
              onClick={handleSaveAppraisal}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Resultado"}
            </Button>
          )}
          <Button variant="outline" className="inline-flex items-center" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
          <Link href="/history">
            <Button variant="outline" className="inline-flex items-center">
              <History className="w-4 h-4 mr-2" />
              Historial
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        id="appraisal-results-content"
      >
        <h1 className="text-3xl font-bold mb-8">Resultados del Peritaje</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Información Básica</h2>
          {appraisalData.informacion_basica && (
            <>
              <p><strong>ID Solicitud:</strong> {appraisalData.informacion_basica.requestId}</p>
              <p><strong>Ciudad:</strong> {appraisalData.informacion_basica.ciudad}</p>
              <p><strong>Tipo de Inmueble:</strong> {appraisalData.informacion_basica.tipo_inmueble}</p>
              <p><strong>Estrato:</strong> {appraisalData.informacion_basica.estrato}</p>
              <p><strong>Área (m²):</strong> {appraisalData.informacion_basica.area_usuario_m2}</p>
            </>
          )}
        </Card>

        {appraisalData.analisis_mercado && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Análisis de Mercado</h2>
            {appraisalData.analisis_mercado.rango_arriendo_referencias_cop && (
                <p><strong>Rango de Arriendo (COP):</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisalData.analisis_mercado.rango_arriendo_referencias_cop.min)} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisalData.analisis_mercado.rango_arriendo_referencias_cop.max)}</p>
              )}
              {appraisalData.analisis_mercado.observacion_mercado && (
                <p><strong>Observación del Mercado:</strong> {appraisalData.analisis_mercado.observacion_mercado}</p>
              )}
          </Card>
        )}

        {appraisalData.valoracion_arriendo_actual && (
           <Card className="p-6 mb-6">
             <h2 className="text-2xl font-semibold mb-4">Valoración de Arriendo Actual</h2>
             {appraisalData.valoracion_arriendo_actual.estimacion_canon_mensual_cop && (
               <p><strong>Estimación Canon Mensual (COP):</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisalData.valoracion_arriendo_actual.estimacion_canon_mensual_cop)}</p>
             )}
             {appraisalData.valoracion_arriendo_actual.justificacion_estimacion_actual && (
               <p><strong>Justificación:</strong> {appraisalData.valoracion_arriendo_actual.justificacion_estimacion_actual}</p>
             )}
           </Card>
         )}

        {appraisalData.potencial_valorizacion_con_mejoras_explicado && (
           <Card className="p-6 mb-6">
             <h2 className="text-2xl font-semibold mb-4">Potencial de Valorización con Mejoras</h2>
             {appraisalData.potencial_valorizacion_con_mejoras_explicado.canon_potencial_total_estimado_cop && (
               <p><strong>Canon Potencial Total Estimado (COP):</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(appraisalData.potencial_valorizacion_con_mejoras_explicado.canon_potencial_total_estimado_cop)}</p>
             )}
             {appraisalData.potencial_valorizacion_con_mejoras_explicado.comentario_estrategia_valorizacion && (
               <p><strong>Comentario Estrategia:</strong> {appraisalData.potencial_valorizacion_con_mejoras_explicado.comentario_estrategia_valorizacion}</p>
             )}
             {appraisalData.potencial_valorizacion_con_mejoras_explicado.mejoras_con_impacto_detallado && appraisalData.potencial_valorizacion_con_mejoras_explicado.mejoras_con_impacto_detallado.length > 0 && (
               <div className="mt-4">
                 <h3 className="text-xl font-medium mb-2">Mejoras Detalladas:</h3>
                 <Accordion type="single" collapsible className="w-full">
                   {appraisalData.potencial_valorizacion_con_mejoras_explicado.mejoras_con_impacto_detallado.map((mejoras, index) => (
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
         )}

       {appraisalData.analisis_cualitativo_arriendo && (
         <Card className="p-6 mb-6">
           <h2 className="text-2xl font-semibold mb-4">Análisis Cualitativo de Arriendo</h2>
           {appraisalData.analisis_cualitativo_arriendo.factores_positivos_potencial && appraisalData.analisis_cualitativo_arriendo.factores_positivos_potencial.length > 0 && (
             <div className="mb-4">
               <h3 className="text-xl font-medium mb-2">Factores Positivos y Potencial:</h3>
               <ul className="list-disc pl-5 space-y-1">
                 {appraisalData.analisis_cualitativo_arriendo.factores_positivos_potencial.map((factor, index) => (
                   <li key={index}>{factor}</li>
                 ))}
               </ul>
             </div>
           )}
           {appraisalData.analisis_cualitativo_arriendo.factores_a_considerar_o_mejorar && appraisalData.analisis_cualitativo_arriendo.factores_a_considerar_o_mejorar.length > 0 && (
             <div className="mb-4">
               <h3 className="text-xl font-medium mb-2">Factores a Considerar o Mejorar:</h3>
               <ul className="list-disc pl-5 space-y-1">
                 {appraisalData.analisis_cualitativo_arriendo.factores_a_considerar_o_mejorar.map((factor, index) => (
                   <li key={index}>{factor}</li>
                 ))}
               </ul>
             </div>
           )}
           {appraisalData.analisis_cualitativo_arriendo.comentario_mercado_general_ciudad && (
             <p><strong>Comentario General del Mercado:</strong> {appraisalData.analisis_cualitativo_arriendo.comentario_mercado_general_ciudad}</p>
           )}
         </Card>
       )}

       {appraisalData.analisis_legal_arrendamiento && (
         <Card className="p-6 mb-6">
           <h2 className="text-2xl font-semibold mb-4">Análisis Legal de Arrendamiento</h2>
           {appraisalData.analisis_legal_arrendamiento.restricciones_legales_identificadas && appraisalData.analisis_legal_arrendamiento.restricciones_legales_identificadas.length > 0 && (
             <div className="mb-4">
               <h3 className="text-xl font-medium mb-2">Restricciones Legales Identificadas:</h3>
               <ul className="list-disc pl-5 space-y-1">
                 {appraisalData.analisis_legal_arrendamiento.restricciones_legales_identificadas.map((restriccion, index) => (
                   <li key={index}>{restriccion}</li>
                 ))}
               </ul>
             </div>
           )}
           {appraisalData.analisis_legal_arrendamiento.observaciones_legales && (
             <p><strong>Observaciones Legales:</strong> {appraisalData.analisis_legal_arrendamiento.observaciones_legales}</p>
           )}
         </Card>
       )}
 
       {appraisalData.recomendaciones_proximos_pasos && appraisalData.recomendaciones_proximos_pasos.length > 0 && (
         <Card className="p-6 mb-6">
           <h2 className="text-2xl font-semibold mb-4">Recomendaciones y Próximos Pasos</h2>
           <ul className="list-disc pl-5 space-y-1">
             {appraisalData.recomendaciones_proximos_pasos.map((recomendacion, index) => (
               <li key={index}>{recomendacion}</li>
             ))}
           </ul>
         </Card>
       )}

      </motion.div>

      <AlertDialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guarda tus resultados</AlertDialogTitle>
            <AlertDialogDescription>
              Inicia sesión o regístrate para guardar este resultado de peritaje en tu historial y acceder a él en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ahora no</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/auth')}>
              Iniciar Sesión / Registrarse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Nuevo AlertDialog para el mensaje de éxito */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Guardado Exitoso!</AlertDialogTitle>
            <AlertDialogDescription>
              El resultado del peritaje ha sido guardado exitosamente en tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Nuevo AlertDialog para el mensaje de resultado ya guardado */}
      <AlertDialog open={showAlreadySavedModal} onOpenChange={setShowAlreadySavedModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resultado ya Guardado</AlertDialogTitle>
            <AlertDialogDescription>
              Este resultado de peritaje ya ha sido guardado previamente en tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlreadySavedModal(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
