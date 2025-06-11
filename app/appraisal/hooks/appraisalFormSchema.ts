import { z } from 'zod';

// Esquema para las entradas de Calidad de Materiales
export const MaterialQualityEntrySchema = z.object({
  material: z.string().min(1, "El material es requerido."),
  quality: z.string().min(1, "La calidad es requerida."),
  description: z.string().optional(),
});

// Esquema para la sección de Propiedad Horizontal (Sección B)
export const PHFieldsSchema = z.object({
  ph_aplica: z.boolean().default(false),
  ph_sometido_ley_675: z.boolean().default(false),
  ph_reglamento_interno: z.boolean().default(false),
  ph_reglamento_cubre_aspectos: z.boolean().default(false),
  ph_escritura_registrada: z.boolean().default(false),
  reglamentoPropiedadHorizontalInscrito: z.boolean().optional(), // Nuevo campo
  deudasCuotasAdministracion: z.boolean().optional(), // Nuevo campo
  ph_tipo_propiedad: z.enum(["Residencial", "Comercial", "Mixto"]).optional(),
  ph_nombre_conjunto: z.string().optional(),
  ph_nit_copropiedad: z.string().optional(),
  ph_restriccion_arrendamiento: z.string().optional(),
  ph_cuotas_pendientes: z.string().optional(),
  ph_normativa_interna: z.string().optional(),
});

// Esquema para la sección de Declaratoria Especial (parte de Sección C)
export const ZonaDeclaratoriaEspecialSchema = z.object({
  aplica: z.boolean().default(false),
  tipo: z.enum(["Histórica (Bien de Interés Cultural - BIC)", "Cultural", "Ambiental", "De Riesgo", "Otra"]).optional(),
  restricciones_comunes: z.array(z.string()).optional(),
  restricciones_comunes_descripcion: z.string().optional(),
  otras_restricciones_seleccion: z.enum(["No aplica", "Sí, especificar"]).default("No aplica"),
  otras_restricciones_descripcion: z.string().optional(),
  fuente: z.string().optional(),
  declaratoriaImponeObligaciones: z.boolean().optional(), // Nuevo campo
}).superRefine((data, ctx) => {
  if (data.aplica) {
    if (!data.tipo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El tipo de declaratoria especial es requerido.",
        path: ['tipo'],
      });
    }
    if (data.restricciones_comunes?.includes('Otra') && !data.restricciones_comunes_descripcion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La descripción de otras restricciones comunes es requerida si se selecciona 'Otra'.",
        path: ['restricciones_comunes_descripcion'],
      });
    }
    if (data.otras_restricciones_seleccion === 'Sí, especificar' && !data.otras_restricciones_descripcion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La descripción de otras restricciones es requerida si se selecciona 'Sí, especificar'.",
        path: ['otras_restricciones_descripcion'],
      });
    }
    if (!data.fuente) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fuente de la declaratoria es requerida.",
        path: ['fuente'],
      });
    }
    if (data.declaratoriaImponeObligaciones === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "¿Esta declaratoria impone obligaciones económicas o de mantenimiento específicas al propietario? es requerido.",
        path: ['declaratoriaImponeObligaciones'],
      });
    }
  }
});

// Esquema para la sección de Declaraciones Legales (Sección H)
export const LegalDeclarationsSchema = z.object({
  declaracion_veracidad: z.boolean().default(false),
  entendimiento_alcance_analisis: z.boolean().default(false),
  declaracion_propiedad_exclusiva: z.boolean().default(false),
  declaracion_uso_previsto: z.boolean().default(false),
  declaracion_cumplimiento_normas: z.boolean().default(false),
  declaracion_sin_litigios: z.boolean().default(false),
  declaracion_servidumbres: z.boolean().default(false),
  declaracion_sin_afectaciones: z.boolean().default(false),
  declaracion_impuestos_pagados: z.boolean().default(false), // Añadido
  declaracion_sin_deudas_asociacion: z.boolean().default(false),
  declaracion_informacion_completa: z.boolean().default(false),
  informacionVerazCompleta: z.boolean().default(false),
  entendimientoAnalisisLegal: z.boolean().default(false),
  autorizacionTratamientoDatos: z.boolean().default(false),
});
// Esquema para una restricción POT individual
export const PotRestrictionSchema = z.object({
  selected: z.boolean().default(false),
  description: z.string().optional(),
});


export const AppraisalFormDataSchema = z.object({
  requestId: z.string().optional(), // Añadir requestId como opcional
  // Sección A: Datos de Ubicación
  department: z.string().min(1, "El departamento es requerido."),
  city: z.string().min(1, "La ciudad es requerida."),
  address: z.string().min(1, "La dirección es requerida."),
  documento_ficha_predial_catastral: z.boolean().default(false), // Renombrado de has_cadastral_certificate
  // Sección B: Detalles de la Propiedad
  property_type: z.string().optional(),
  estrato: z.string().min(1, "El estrato es requerido."),
  built_area: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, "El área construida debe ser un número positivo.").optional()
  ),
  // Sección C: Restricciones y Afectaciones
  pot_restriccion_uso_suelo: PotRestrictionSchema,
  pot_restriccion_edificabilidad: PotRestrictionSchema,
  pot_restriccion_altura: PotRestrictionSchema,
  pot_afectacion_via_publica: PotRestrictionSchema,
  pot_afectacion_ronda_hidrica: PotRestrictionSchema,
  pot_afectacion_infraestructura_servicios_publicos: PotRestrictionSchema,
  pot_otra_restriccion_pot: PotRestrictionSchema, // Este es el campo para "Otra restricción POT"
  pot_otras_restricciones_descripcion: z.string().optional(), // Este campo se usará si pot_otra_restriccion_pot.selected es true
  zona_declaratoria_especial: ZonaDeclaratoriaEspecialSchema,
  // Sección D: Condiciones del Contrato de Arrendamiento
  contrato_escrito_vigente: z.string().optional(),
  preferencia_requisito_futuro_contrato: z.string().optional(),
  responsable_servicios_publicos: z.string().optional(),
  // Sección E: Estado Legal, Gravámenes y Cargas
  gravamenes_cargas_seleccionados: z.array(z.string()).optional(),
  gravamen_hipoteca_description: z.string().optional(),
  gravamen_embargo_description: z.string().optional(),
  gravamen_servidumbre_description: z.string().optional(),
  gravamen_prenda_description: z.string().optional(),
  gravamen_usufructo_description: z.string().optional(),
  gravamenes_cargas_otros: z.string().optional(), // Este campo ya existía para "Otros"
  litigios_proceso_judicial_seleccionados: z.array(z.string()).optional(),
  litigio_demanda_propiedad_description: z.string().optional(),
  litigio_proceso_sucesion_description: z.string().optional(),
  litigio_disputa_linderos_description: z.string().optional(),
  litigio_ejecucion_hipotecaria_description: z.string().optional(),
  litigios_proceso_judicial_otros: z.string().optional(), // Este campo ya existía para "Otros"
  impuestoPredialAlDia: z.boolean().optional(), // Nuevo campo movido de Sección H a Sección E
  // Sección F: Habitabilidad, Seguridad y Servicios Públicos
  acceso_servicios_publicos: z.string().optional(),
  serviciosConectadosFuncionando: z.boolean().optional(),
  deudasServiciosPublicos: z.boolean().optional(),
  condiciones_seguridad_salubridad: z.string().optional(),
  cumpleNormasSismoresistencia: z.boolean().optional(),
  riesgosEvidentesHabitabilidad: z.boolean().optional(),
  riesgosEvidentesHabitabilidadDescription: z.string().optional(), // Campo de texto para descripción
  seguros_obligatorios_recomendables: z.string().optional(),
  cuentaPolizaSeguroVigente: z.boolean().optional(),
  // Sección G: Aspectos Legales y Documentales
  documento_certificado_tradicion_libertad: z.boolean().default(false),
  documento_escritura_publica: z.boolean().default(false),
  documento_recibo_impuesto_predial: z.boolean().default(false),
  documento_paz_salvo_administracion: z.boolean().default(false),
  documento_reglamento_ph: z.boolean().default(false),
  documentos_otros: z.string().optional(),
  // Sección H: Declaraciones Adicionales
  legal_declarations: LegalDeclarationsSchema, // Usar el esquema anidado
  // Otros campos
  expectedValue: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "El valor esperado debe ser un número positivo.")
  ),
  images: z.array(z.instanceof(File)).min(1, "Debe subir al menos una imagen del inmueble."),
  admin_fee: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, "La administración debe ser un número positivo.").optional()
  ),
}).merge(PHFieldsSchema).superRefine((data, ctx) => {
  // Validaciones de PHFieldsSchema movidas aquí
  if (data.ph_aplica) {
    if (data.ph_sometido_ley_675 === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si el inmueble está sometido a la Ley 675 de 2001.",
        path: ['ph_sometido_ley_675'],
      });
    }
    if (data.ph_reglamento_interno === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si existe un reglamento interno.",
        path: ['ph_reglamento_interno'],
      });
    }
    if (data.ph_reglamento_cubre_aspectos === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si el reglamento cubre aspectos relevantes.",
        path: ['ph_reglamento_cubre_aspectos'],
      });
    }
    if (data.ph_escritura_registrada === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si la escritura está registrada.",
        path: ['ph_escritura_registrada'],
      });
    }
    if (!data.ph_tipo_propiedad) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El tipo de propiedad es requerido si aplica PH.",
        path: ['ph_tipo_propiedad'],
      });
    }
    if (!data.ph_nombre_conjunto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre del conjunto/edificio es requerido si aplica PH.",
        path: ['ph_nombre_conjunto'],
      });
    }
    if (!data.ph_nit_copropiedad) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El NIT de la copropiedad es requerido si aplica PH.",
        path: ['ph_nit_copropiedad'],
      });
    }
  }
}).superRefine((data, ctx) => {
  if (data.ph_aplica) {
    if (data.reglamentoPropiedadHorizontalInscrito === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si el Reglamento de Propiedad Horizontal está inscrito.",
        path: ['reglamentoPropiedadHorizontalInscrito'],
      });
    }
    if (data.deudasCuotasAdministracion === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe confirmar si existen deudas por cuotas de administración.",
        path: ['deudasCuotasAdministracion'],
      });
    }
  }
});

// Tipo inferido para los datos del formulario
export type AppraisalFormData = z.infer<typeof AppraisalFormDataSchema>;