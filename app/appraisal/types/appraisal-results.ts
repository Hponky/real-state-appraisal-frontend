export interface InformacionBasica {
  requestId: string;
  ciudad: string;
  tipo_inmueble: string;
  estrato: string;
  area_usuario_m2: number;
}

export interface RangoArriendoReferenciasCop {
  min: number;
  max: number;
}

export interface AnalisisMercado {
  rango_arriendo_referencias_cop: RangoArriendoReferenciasCop;
  observacion_mercado: string;
}

export interface ValoracionArriendoActual {
  estimacion_canon_mensual_cop: number;
  justificacion_estimacion_actual: string;
}

export interface MejoraConImpactoDetallado {
  recomendacion_tecnica_evaluada: string;
  justificacion_tecnica_original_relevancia: string;
  incremento_estimado_canon_cop: number;
  justificacion_estimacion_incremento_economico: string;
}

export interface PotencialValorizacionConMejorasExplicado {
  mejoras_con_impacto_detallado: MejoraConImpactoDetallado[];
  canon_potencial_total_estimado_cop: number;
  comentario_estrategia_valorizacion: string;
}

export interface AnalisisCualitativoArriendo {
  factores_positivos_potencial: string[];
  factores_a_considerar_o_mejorar: string[];
  comentario_mercado_general_ciudad: string;
}

export interface AnalisisLegalArrendamiento {
  requestId?: string; // Optional, as it's also at the root
  tipo_uso_principal_analizado?: string;
  viabilidad_general_preliminar?: string;
  puntos_criticos_y_riesgos?: any[]; // Using any[] as the exact structure is not provided
  documentacion_clave_a_revisar_o_completar?: any[]; // Using any[] as the exact structure is not provided
  consideraciones_contractuales_sugeridas?: string[];
  resumen_ejecutivo_legal?: string;
  restricciones_legales_identificadas?: string[];
  observaciones_legales?: string;
}

export interface AppraisalResult {
  requestId: string;
  informacion_basica: InformacionBasica;
  // Campos para la primera estructura (original)
  analisis_mercado?: AnalisisMercado;
  valoracion_arriendo_actual?: ValoracionArriendoActual;
  potencial_valorizacion_con_mejoras_explicado?: PotencialValorizacionConMejorasExplicado;
  // Campos para la segunda estructura (nueva)
  analisis_cualitativo_arriendo?: AnalisisCualitativoArriendo;
  analisis_legal_arrendamiento?: AnalisisLegalArrendamiento;
  recomendaciones_proximos_pasos?: string[];
  gemini_usage_metadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: Array<{
      modality: string;
      tokenCount: number;
    }>;
    thoughtsTokenCount: number;
  };
}
