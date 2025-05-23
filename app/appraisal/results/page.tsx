"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const [appraisalData, setAppraisalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id'); // Leer el ID de la URL

    if (!requestId) {
      setError("No appraisal request ID found in the URL.");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/appraisal/status?id=${requestId}`, {
          credentials: 'include', // Incluir cookies de autenticación
        });
        const result = await response.json();

        if (response.ok && result.status === 'completed') {
          // Resultados listos, establecer los datos
          // Los datos relevantes están en result.results.initial_data
          setAppraisalData(result.results);
        } else if (response.status === 202) {
          // Todavía pendiente, podrías mostrar un mensaje diferente o seguir esperando (aunque el polling se hace en la página del formulario)
          setError("Appraisal is still pending. Please wait or try refreshing.");
        } else {
          // Error o no encontrado
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
  }, []); // Empty dependency array means this runs once on mount

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
      >
        <h1 className="text-3xl font-bold mb-8">Resultados del Peritaje</h1>

        {/* Mostrar los datos formateados */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Información General</h2>
          {appraisalData.initial_data && (
            <>
              <p><strong>ID Solicitud:</strong> {appraisalData.requestId}</p>
              <p><strong>Ciudad:</strong> {appraisalData.initial_data.ciudad}</p>
              <p><strong>Tipo de Inmueble:</strong> {appraisalData.initial_data.tipo_inmueble}</p>
              <p><strong>Estrato:</strong> {appraisalData.initial_data.estrato}</p>
              <p><strong>Área (m²):</strong> {appraisalData.initial_data.area_usuario_m2}</p>
              <p><strong>Dirección:</strong> {appraisalData.initial_data.direccion}</p>
            </>
          )}
        </Card>

        {appraisalData.initial_data?.analisis_mercado && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Análisis de Mercado</h2>
            {appraisalData.initial_data.analisis_mercado.rango_mercado_cop && (
              <p><strong>Rango de Mercado (COP):</strong> {appraisalData.initial_data.analisis_mercado.rango_mercado_cop.min} - {appraisalData.initial_data.analisis_mercado.rango_mercado_cop.max}</p>
            )}
            {appraisalData.initial_data.analisis_mercado.resumen_mercado && (
              <p><strong>Resumen:</strong> {appraisalData.initial_data.analisis_mercado.resumen_mercado}</p>
            )}
          </Card>
        )}

        {appraisalData.initial_data?.evaluacion_tecnica?.observaciones_tecnicas_clave && appraisalData.initial_data.evaluacion_tecnica.observaciones_tecnicas_clave.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Evaluación Técnica</h2>
            <h3 className="text-xl font-medium mb-2">Observaciones Clave:</h3>
            <ul className="list-disc list-inside">
              {appraisalData.initial_data.evaluacion_tecnica.observaciones_tecnicas_clave.map((obs: string, index: number) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          </Card>
        )}

        {appraisalData.initial_data?.valoracion_actual && (
           <Card className="p-6 mb-6">
             <h2 className="text-2xl font-semibold mb-4">Valoración Actual</h2>
             {appraisalData.initial_data.valoracion_actual.estimacion_arriendo_actual_cop && (
               <p><strong>Estimación Arriendo Actual (COP):</strong> {appraisalData.initial_data.valoracion_actual.estimacion_arriendo_actual_cop}</p>
             )}
           </Card>
        )}

        {appraisalData.initial_data?.potencial_valorizacion && (
           <Card className="p-6 mb-6">
             <h2 className="text-2xl font-semibold mb-4">Potencial de Valorización</h2>
             {appraisalData.initial_data.potencial_valorizacion.arriendo_potencial_total_estimado_cop && (
               <p><strong>Arriendo Potencial Estimado (COP):</strong> {appraisalData.initial_data.potencial_valorizacion.arriendo_potencial_total_estimado_cop}</p>
             )}
             {appraisalData.initial_data.potencial_valorizacion.recomendaciones_valorizacion && appraisalData.initial_data.potencial_valorizacion.recomendaciones_valorizacion.length > 0 && (
               <>
                 <h3 className="text-xl font-medium mb-2">Recomendaciones:</h3>
                 <ul className="list-disc list-inside">
                   {appraisalData.initial_data.potencial_valorizacion.recomendaciones_valorizacion.map((rec: any, index: number) => (
                     <li key={index}>
                       {rec.recomendacion} (Aumento Potencial Estimado: {rec.aumento_potencial_estimado_cop} COP)
                     </li>
                   ))}
                 </ul>
               </>
             )}
           </Card>
        )}


      </motion.div>
    </div>
  );
}