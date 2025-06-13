"use client";

import { useAppraisalResults } from "@/app/appraisal/hooks/useAppraisalResults";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppraisalHeaderActions } from "@/components/appraisal-results/AppraisalHeaderActions";
import { AppraisalMarketAnalysis } from "@/components/appraisal-results/AppraisalMarketAnalysis";
import { AppraisalCurrentRentValuation } from "@/components/appraisal-results/AppraisalCurrentRentValuation";
import { AppraisalValorizationPotential } from "@/components/appraisal-results/AppraisalValorizationPotential";
import { AppraisalLegalAnalysis } from "@/components/appraisal-results/AppraisalLegalAnalysis";
import { AppraisalModals } from "@/components/appraisal-results/AppraisalModals";

export default function Results() {
  const {
    appraisalData,
    loading,
    error,
    showLoginModal,
    setShowLoginModal,
    showSuccessModal,
    setShowSuccessModal,
    showAlreadySavedModal,
    setShowAlreadySavedModal,
    isSaving,
    handleDownloadPdf,
    handleSaveAppraisal,
    user,
    session,
  } = useAppraisalResults();

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
      <AppraisalHeaderActions
        user={user}
        isSaving={isSaving}
        onSave={handleSaveAppraisal}
        onDownload={handleDownloadPdf}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        id="appraisal-results-content"
      >
        <h1 className="text-3xl font-bold mb-8">Resultados del Peritaje</h1>

        <AppraisalMarketAnalysis marketAnalysis={appraisalData.appraisal_data.analisis_mercado} />
        <AppraisalCurrentRentValuation currentRentValuation={appraisalData.appraisal_data.valoracion_arriendo_actual} />
        <AppraisalValorizationPotential valorizationPotential={appraisalData.appraisal_data.potencial_valorizacion_con_mejoras_explicado} />
        <AppraisalLegalAnalysis legalAnalysis={appraisalData.appraisal_data.analisis_legal_arrendamiento} />
      </motion.div>

      <AppraisalModals
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        showAlreadySavedModal={showAlreadySavedModal}
        setShowAlreadySavedModal={setShowAlreadySavedModal}
      />
    </div>
  );
}
