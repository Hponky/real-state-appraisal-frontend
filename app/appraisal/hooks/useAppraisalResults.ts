import { useEffect, useState } from "react";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import { useAuth } from "@/hooks/useAuth";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { useToast } from "@/hooks/use-toast";

export function useAppraisalResults() {
  const [appraisalData, setAppraisalData] = useState<AppraisalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySavedModal, setShowAlreadySavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

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
          if (result.results && result.results.appraisal_data) {
            const parsedAppraisalData = JSON.parse(result.results.appraisal_data);
            setAppraisalData({
              request_id: result.results.request_id,
              initial_data: result.results.initial_data,
              appraisal_data: {
                analisis_mercado: parsedAppraisalData.analisis_mercado,
                valoracion_arriendo_actual: parsedAppraisalData.valoracion_arriendo_actual,
                potencial_valorizacion_con_mejoras_explicado: parsedAppraisalData.potencial_valorizacion_con_mejoras_explicado,
                analisis_legal_arrendamiento: parsedAppraisalData.analisis_legal_arrendamiento,
                gemini_usage_metadata: parsedAppraisalData.gemini_usage_metadata,
              },
              user_id: result.results.user_id,
              created_at: result.results.created_at,
            });
          } else {
            setError("Invalid appraisal results format or missing appraisal data.");
          }
        } else if (response.status === 202) {
          setError("Appraisal is still pending. Please wait or try refreshing.");
        } else {
          setError(result.error || 'Failed to fetch appraisal results.');
        }
      } catch (error) {
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

  const handleDownloadPdf = async () => {
    if (!appraisalData?.request_id) {
      return;
    }

    if (user && user.email && session?.access_token) {
      try {
        const pdfBlob = await appraisalApiService.downloadPdf(appraisalData, session.access_token);
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados-peritaje-${appraisalData.request_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      } catch (err) {
        setError("Error al descargar el PDF desde el servidor. Intentando descarga local...");
      }
    } else {
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
    if (!appraisalData?.request_id) {
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

  return {
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
  };
}