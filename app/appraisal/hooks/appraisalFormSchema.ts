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
  declaracion_impuestos_pagados: z.boolean().default(false),
  declaracion_sin_deudas_asociacion: z.boolean().default(false),
  declaracion_informacion_completa: z.boolean().default(false),
});


export const AppraisalFormDataSchema = z.object({
  // Sección A: Datos de Ubicación
  department: z.string().min(1, "El departamento es requerido."),
  city: z.string().min(1, "La ciudad es requerida."),
  neighborhood: z.string().min(1, "El barrio es requerido."),
  address: z.string().min(1, "La dirección es requerida."),
  cadastral_certificate: z.string().min(1, "El certificado catastral es requerido."),
  // Sección B: Detalles de la Propiedad
  property_type: z.string().min(1, "El tipo de propiedad es requerido."),
  built_area: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "El área construida debe ser un número positivo.")
  ),
  private_area: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "El área privada debe ser un número positivo.")
  ),
  number_of_floors: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "El número de pisos debe ser un número positivo.")
  ),
  estrato: z.string().min(1, "El estrato es requerido."),
  // Sección C: Restricciones y Afectaciones
  pot_restrictions: z.array(z.string()).optional(), // Cambiado a array de strings
  pot_otras_restricciones_descripcion: z.string().optional(), // Nuevo campo para la descripción de "Otra restricción POT"
  zona_declaratoria_especial: ZonaDeclaratoriaEspecialSchema, // Usar el esquema anidado
  // Sección D: Características Físicas
  construction_year: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1800, "El año de construcción debe ser un año válido.").max(new Date().getFullYear(), "El año de construcción no puede ser en el futuro.")
  ),
  structural_type: z.string().min(1, "El tipo estructural es requerido."),
  facade_type: z.string().min(1, "El tipo de fachada es requerido."),
  // Sección E: Estado Legal, Gravámenes y Cargas
  gravamenes_cargas_seleccionados: z.array(z.string()).optional(),
  gravamenes_cargas_otros: z.string().optional(),
  litigios_proceso_judicial_seleccionados: z.array(z.string()).optional(),
  litigios_proceso_judicial_otros: z.string().optional(),
  // Sección F: Aspectos Urbanísticos y de Entorno
  urban_planning: z.string().min(1, "El plan urbanístico es requerido."),
  access_roads: z.string().min(1, "Las vías de acceso son requeridas."),
  public_services: z.array(z.string()).min(1, "Debe seleccionar al menos un servicio público."),
  // Sección G: Aspectos Legales y Documentales
  legal_documents: z.array(z.string()).min(1, "Debe adjuntar al menos un documento legal."),
  // Sección H: Declaraciones Adicionales
  legal_declarations: LegalDeclarationsSchema, // Usar el esquema anidado
  // Otros campos
  expectedValue: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "El valor esperado debe ser un número positivo.")
  ),
  images: z.array(z.string()).min(1, "Debe subir al menos una imagen del inmueble."),
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
});

// Tipo inferido para los datos del formulario
export type AppraisalFormData = z.infer<typeof AppraisalFormDataSchema>;