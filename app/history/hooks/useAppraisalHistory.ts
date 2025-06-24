"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabase } from "@/components/supabase-provider";
import { appraisalApiService } from "@/app/services/appraisalApiService";
import { useToast } from "@/hooks/use-toast";
import { ParsedAppraisal, parseAppraisalData } from "../utils/parsing";

export const useAppraisalHistory = () => {
  const [appraisals, setAppraisals] = useState<ParsedAppraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const { supabase } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppraisals = async () => {
      if (isAuthLoading) return;
      setLoading(true);

      try {
        let data: any[] = [];
        if (user && session?.access_token) {
          data = await appraisalApiService.getAppraisalHistory(session.access_token);
        } else {
          const anonymousSessionId = localStorage.getItem('anonymous_session_id');
          if (anonymousSessionId && supabase) {
            data = await appraisalApiService.getAnonymousAppraisals(supabase, anonymousSessionId);
          }
        }
        
        const parsedData = parseAppraisalData(data);
        setAppraisals(parsedData);

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
  }, [user, session, isAuthLoading, supabase, toast]);

  return { appraisals, loading, isAuthLoading };
};