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
        const response = await fetch(`/api/appraisal/status?id=${requestId}`);
        const result = await response.json();

        if (response.ok && result.status === 'completed') {
          // Resultados listos, establecer los datos
          setAppraisalData(result.results); // Asumiendo que 'results' contiene los datos del peritaje
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


  // Display the raw received data
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Link>
        {/* Historial button remains, but download button is removed as PDF generation is removed */}
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
        {/* Mostrar los datos crudos recibidos de la API */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Datos del Peritaje</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(appraisalData, null, 2)}
          </pre>
        </Card>

        {/* Aquí podrías añadir lógica para formatear y mostrar los datos de appraisalData
             en lugar de solo el JSON crudo, basándote en la estructura de los resultados
             que n8n guarda en Supabase. */}

      </motion.div>
    </div>
  );
}