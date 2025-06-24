import { useEffect, useState, useCallback } from "react";
import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";
import { useAuth } from "@/hooks/useAuth";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/components/supabase-provider";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useAppraisalResults() {
  const { supabase, session: userSession } = useSupabase(); // Use the shared client
  const [appraisalData, setAppraisalData] = useState<AppraisalResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySavedModal, setShowAlreadySavedModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const fetchAndSetAppraisal = useCallback(async (requestId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appraisal/details?id=${requestId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Appraisal ${requestId} not found yet. Starting listener.`);
          return null;
        }
        throw new Error(`Failed to fetch appraisal: ${response.statusText}`);
      }

      const appraisal: AppraisalResult = await response.json();

      if (appraisal) {
        setAppraisalData(appraisal);
        if (appraisal.status === 'completed') {
          setIsLoading(false);
          return appraisal;
        }
      }
      return appraisal;
    } catch (err: any) {
      console.error("Error fetching appraisal:", err);
      setError("Failed to fetch appraisal data.");
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id');
    let channel: RealtimeChannel | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    if (!requestId) {
      setError("No appraisal request ID found in the URL.");
      setIsLoading(false);
      return;
    }

    const cleanup = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const setupSubscription = () => {
      channel = supabase
        .channel(`appraisal-updates-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'appraisals',
            filter: `id=eq.${requestId}`,
          },
          (payload) => {
            console.log('Received realtime update:', payload);
            const updatedAppraisal = payload.new as AppraisalResult;
            setAppraisalData(updatedAppraisal);
            if (updatedAppraisal.status === 'completed') {
              setIsLoading(false);
              cleanup();
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to appraisal ${requestId}`);
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('Subscription error:', err);
            setError('Connection to real-time service failed.');
            setIsLoading(false);
            cleanup();
          }
        });
    };

    const startPolling = () => {
      if (pollInterval) return; // Evitar múltiples intervalos
      console.log(`Starting polling for appraisal ${requestId}`);
      pollInterval = setInterval(async () => {
        console.log(`Polling for appraisal ${requestId}...`);
        const data = await fetchAndSetAppraisal(requestId);
        if (data?.status === 'completed') {
          console.log(`Polling found completed appraisal ${requestId}. Stopping.`);
          cleanup();
        }
      }, 5000); // Sondeo cada 5 segundos
    };

    const initialize = async () => {
      const initialData = await fetchAndSetAppraisal(requestId);

      if (initialData?.status !== 'completed') {
        setupSubscription();
        startPolling();
      }
    };

    initialize();

    return cleanup;
  }, [fetchAndSetAppraisal, supabase]);

  useEffect(() => {
    // Solo mostrar el modal si el usuario no está autenticado, la carga del peritaje ha terminado,
    // no hay errores, hay datos de peritaje Y la autenticación ha terminado de cargar.
    if (
      appraisalData &&
      !isLoading &&
      !error &&
      !isAuthLoading &&
      user?.is_anonymous === true &&
      appraisalData.user_id === null
    ) {
      setShowLoginModal(true);
    }
  }, [user, isLoading, error, appraisalData, isAuthLoading]);

  const handleDownloadPdf = async () => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id');

    if (!requestId) {
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el PDF: ID de peritaje no disponible.",
        variant: "destructive",
      });
      return;
    }

    if (user && user.email && userSession?.access_token) {
      try {
        await appraisalApiService.downloadPdf(requestId, userSession.access_token);
        toast({
          title: "Descarga iniciada",
          description: "El PDF debería comenzar a descargarse en breve.",
        });
      } catch (err) {
        setError("Error al descargar el PDF desde el servidor.");
        toast({
          title: "Error de descarga",
          description: "Error al descargar el PDF desde el servidor.",
          variant: "destructive",
        });
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
    if (!user || !user.email || !userSession?.access_token) {
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
        userSession.access_token
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
    isLoading,
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
    session: userSession,
  };
}