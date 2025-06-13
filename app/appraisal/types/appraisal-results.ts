export interface PotRestriction {
  selected: boolean;
  description?: string; // Make description optional
}

export interface ZonaDeclaratoriaEspecial {
  aplica: boolean;
  tipo?: string; // Make tipo optional
  restricciones_comunes?: string[]; // Make restricciones_comunes optional
  restricciones_comunes_descripcion?: string; // Also make this optional based on schema
  otras_restricciones_seleccion: string;
  otras_restricciones_descripcion?: string; // Also make this optional based on schema
  fuente?: string; // Also make this optional based on schema
  declaratoriaImponeObligaciones?: boolean; // Also make this optional based on schema
}

export interface LegalDeclarations {
  declaracion_veracidad: boolean;
  entendimiento_alcance_analisis: boolean;
  declaracion_propiedad_exclusiva: boolean;
  declaracion_uso_previsto: boolean;
  declaracion_cumplimiento_normas: boolean;
  declaracion_sin_litigios: boolean;
  declaracion_servidumbres: boolean;
  declaracion_sin_afectaciones: boolean;
  declaracion_impuestos_pagados: boolean;
  declaracion_sin_deudas_asociacion: boolean;
  declaracion_informacion_completa: boolean;
  informacionVerazCompleta: boolean;
  entendimientoAnalisisLegal: boolean;
  autorizacionTratamientoDatos: boolean;
}

export interface MaterialQualityEntry {
  material: string;
  quality: string;
  description: string;
}

export interface AppraisalFormData {
  requestId: string;
  department: string;
  city: string;
  address: string;
  built_area: number;
  documento_ficha_predial_catastral: boolean;
  property_type: string;
  estrato: string;
  pot_restriccion_uso_suelo: PotRestriction;
  pot_restriccion_edificabilidad: PotRestriction;
  pot_restriccion_altura: PotRestriction;
  pot_afectacion_via_publica: PotRestriction;
  pot_afectacion_ronda_hidrica: PotRestriction;
  pot_afectacion_infraestructura_servicios_publicos: PotRestriction;
  pot_otra_restriccion_pot: PotRestriction;
  zona_declaratoria_especial: ZonaDeclaratoriaEspecial;
  gravamenes_cargas_seleccionados: string[];
  gravamenes_cargas_otros: string;
  litigios_proceso_judicial_seleccionados: string[];
  litigios_proceso_judicial_otros: string;
  documento_certificado_tradicion_libertad: boolean;
  documento_escritura_publica: boolean;
  documento_recibo_impuesto_predial: boolean;
  documento_paz_salvo_administracion: boolean;
  documento_reglamento_ph: boolean;
  documentos_otros: string;
  legal_declarations: LegalDeclarations;
  expectedValue: number;
  ph_aplica: boolean;
  ph_sometido_ley_675: boolean;
  ph_reglamento_interno: boolean;
  ph_reglamento_cubre_aspectos: boolean;
  ph_escritura_registrada: boolean;
  ph_tipo_propiedad: string;
  ph_nombre_conjunto: string;
  ph_nit_copropiedad: string;
  ph_restriccion_arrendamiento: string;
  ph_cuotas_pendientes: string;
  ph_normativa_interna: string;
  impuestoPredialAlDia: boolean;
  reglamentoPropiedadHorizontalInscrito: boolean;
  deudasCuotasAdministracion: boolean;
  pot_otras_restricciones_descripcion: string;
  contrato_escrito_vigente: string;
  preferencia_requisito_futuro_contrato: string;
  responsable_servicios_publicos: string;
  gravamen_hipoteca_description: string;
  gravamen_embargo_description: string;
  gravamen_servidumbre_description: string;
  gravamen_prenda_description: string;
  gravamen_usufructo_description: string;
  litigio_demanda_propiedad_description: string;
  litigio_proceso_sucesion_description: string;
  litigio_disputa_linderos_description: string;
  litigio_ejecucion_hipotecaria_description: string;
  acceso_servicios_publicos: string;
  serviciosConectadosFuncionando: boolean;
  deudasServiciosPublicos: boolean;
  condiciones_seguridad_salubridad: string;
  cumpleNormasSismoresistencia: boolean;
  riesgosEvidentesHabitabilidad: boolean;
  riesgosEvidentesHabitabilidadDescription: string;
  seguros_obligatorios_recomendables?: string; // Changed from boolean to string and made optional
  cuentaPolizaSeguroVigente: boolean;
  admin_fee: number;
  imagesBase64: string[];
  materialQualityEntries: MaterialQualityEntry[];
}

export interface PuntoCritico {
  aspecto_legal_relevante: string;
  descripcion_implicacion_riesgo: string;
  normativa_aplicable_sugerida: string;
  recomendacion_accion_para_arrendador: string;
}

export interface DocumentoClave {
  documento: string;
}

// Las interfaces originales se mantienen si aún son necesarias para otras partes de la aplicación
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

export interface AnalisisMercadoArriendo {
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

export interface PotencialValorizacionArriendo {
  mejoras_con_impacto_detallado: MejoraConImpactoDetallado[];
  canon_potencial_total_estimado_cop: number;
  comentario_estrategia_valorizacion: string;
}

export interface AnalisisLegalArrendamiento {
  requestId: string;
  tipo_uso_principal_analizado: string;
  viabilidad_general_preliminar: string;
  puntos_criticos_y_riesgos: PuntoCritico[];
  documentacion_clave_a_revisar_o_completar: DocumentoClave[];
  consideraciones_contractuales_sugeridas: string[];
  resumen_ejecutivo_legal: string;
}

export interface InitialData {
  ciudad: string;
  address: string;
  area_usuario_m2: number;
  tipo_inmueble: string;
  estrato: string;
}

export interface AppraisalResult {
  id: string; // Add this field
  request_id: string;
  initial_data: InitialData;
  appraisal_data: {
    analisis_mercado: AnalisisMercadoArriendo;
    valoracion_arriendo_actual: ValoracionArriendoActual;
    potencial_valorizacion_con_mejoras_explicado: PotencialValorizacionArriendo;
    analisis_legal_arrendamiento: AnalisisLegalArrendamiento;
    gemini_usage_metadata: {
      economico: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
        promptTokensDetails: Array<{
          modality: string;
          tokenCount: number;
        }>;
        thoughtsTokenCount: number;
      };
    };
  };
  user_id: string;
  created_at: string;
}
