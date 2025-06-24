"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import AppraisalDetailModal from "@/components/AppraisalDetailModal";
import { useToast } from "@/hooks/use-toast";
import { useAppraisalHistory } from "./hooks/useAppraisalHistory";
import { AppraisalHistoryCard } from "./components/AppraisalHistoryCard";
import { ParsedAppraisal } from "./utils/parsing";

export default function History() {
  const { appraisals, loading, isAuthLoading } = useAppraisalHistory();
  const [filteredAppraisals, setFilteredAppraisals] = useState<ParsedAppraisal[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<ParsedAppraisal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setFilteredAppraisals(appraisals);
  }, [appraisals]);

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
              <AppraisalHistoryCard
                key={appraisal.id}
                appraisal={appraisal}
                onCardClick={handleCardClick}
                onDownloadPdf={handleDownloadPDF}
              />
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
