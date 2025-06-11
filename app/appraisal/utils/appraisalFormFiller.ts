import { AppraisalFormData } from '../hooks/appraisalFormSchema';
import { MaterialQualityEntry } from '../hooks/useMaterialQualityEntries'; // Importar la interfaz

// Helper para generar IDs únicos para las entradas de calidad de materiales
let materialEntryCounter = 0;
const generateMaterialEntryId = () => `material-entry-${Date.now()}-${materialEntryCounter++}`;

export const getPreFilledMaterialQualityEntries = (): MaterialQualityEntry[] => {
  return [
    { id: generateMaterialEntryId(), location: "Cocina", qualityDescription: "Encimeras de granito, electrodomésticos de acero inoxidable." },
    { id: generateMaterialEntryId(), location: "Baños", qualityDescription: "Grifería de alta gama, azulejos de cerámica." },
    { id: generateMaterialEntryId(), location: "Salón", qualityDescription: "Pisos de madera, ventanas de doble panel." },
  ];
};

export const getPreFilledAppraisalFormData = (): AppraisalFormData => {
  return {
    // Sección A: Datos de Ubicación
    department: "Caldas",
    city: "Manizales",
    address: "Calle 123 #45-67",
    documento_ficha_predial_catastral: true,

    // Sección B: Detalles de la Propiedad
    property_type: "Casa",
    estrato: "4",
    built_area: 80,
    ph_aplica: true,
    ph_sometido_ley_675: true,
    ph_reglamento_interno: true,
    ph_reglamento_cubre_aspectos: true,
    ph_escritura_registrada: true,
    reglamentoPropiedadHorizontalInscrito: true,
    deudasCuotasAdministracion: false,
    ph_tipo_propiedad: "Residencial",
    ph_nombre_conjunto: "Conjunto Residencial Ejemplo",
    ph_nit_copropiedad: "900123456-7",
    ph_restriccion_arrendamiento: "Ninguna",
    ph_cuotas_pendientes: "No",
    ph_normativa_interna: "Sí",

    // Sección C: Restricciones y Afectaciones
    pot_restriccion_uso_suelo: { selected: true, description: "Uso residencial permitido según POT." },
    pot_restriccion_edificabilidad: { selected: true, description: "Restricción de edificabilidad por altura máxima." },
    pot_restriccion_altura: { selected: true, description: "Altura máxima permitida de 5 pisos." },
    pot_afectacion_via_publica: { selected: true, description: "Afectación por futura ampliación de vía." },
    pot_afectacion_ronda_hidrica: { selected: true, description: "Afectación por cercanía a quebrada." },
    pot_afectacion_infraestructura_servicios_publicos: { selected: true, description: "Afectación por línea de alta tensión." },
    pot_otra_restriccion_pot: { selected: true, description: "Restricción por plan parcial de desarrollo." },
    pot_otras_restricciones_descripcion: "Detalle de otras restricciones POT.",
    zona_declaratoria_especial: {
      aplica: true,
      tipo: "Histórica (Bien de Interés Cultural - BIC)",
      restricciones_comunes: ["Protección del patrimonio arquitectónico", "Normas de intervención", "Uso del suelo específico", "Regulación de publicidad y fachadas"],
      restricciones_comunes_descripcion: "Restricciones de protección del patrimonio arquitectónico, normas de intervención, uso del suelo específico y regulación de publicidad y fachadas por ser BIC.",
      otras_restricciones_seleccion: "Sí, especificar",
      otras_restricciones_descripcion: "Restricciones adicionales por ser zona de desarrollo especial.",
      fuente: "Decreto 123 de 2020",
      declaratoriaImponeObligaciones: true,
    },

    // Sección D: Condiciones del Contrato de Arrendamiento
    contrato_escrito_vigente: "Sí",
    preferencia_requisito_futuro_contrato: "No",
    responsable_servicios_publicos: "Arrendatario",

    // Sección E: Estado Legal, Gravámenes y Cargas
    gravamenes_cargas_seleccionados: ["hipoteca", "embargo", "servidumbre", "prenda", "usufructo", "otros"],
    gravamen_hipoteca_description: "Hipoteca con Banco Ejemplo S.A.",
    gravamen_embargo_description: "Embargo por deuda fiscal.",
    gravamen_servidumbre_description: "Servidumbre de tránsito a favor del predio vecino.",
    gravamen_prenda_description: "Prenda sobre bienes muebles del inmueble.",
    gravamen_usufructo_description: "Usufructo vitalicio a favor de Juan Pérez.",
    gravamenes_cargas_otros: "Otra carga legal: anotación de demanda.",
    litigios_proceso_judicial_seleccionados: ["demanda_propiedad", "proceso_sucesion", "disputa_linderos", "ejecucion_hipotecaria", "otros"],
    litigio_demanda_propiedad_description: "Demanda de pertenencia en curso.",
    litigio_proceso_sucesion_description: "Proceso de sucesión intestada pendiente.",
    litigio_disputa_linderos_description: "Disputa de linderos con el predio colindante.",
    litigio_ejecucion_hipotecaria_description: "Proceso de ejecución hipotecaria iniciado por el banco.",
    litigios_proceso_judicial_otros: "Otro litigio: proceso de expropiación por parte del distrito.",
    impuestoPredialAlDia: true,

    // Sección F: Habitabilidad, Seguridad y Servicios Públicos
    acceso_servicios_publicos: "Todos",
    serviciosConectadosFuncionando: true,
    deudasServiciosPublicos: false, // Mantener en false para no generar validación de descripción
    condiciones_seguridad_salubridad: "Buenas condiciones generales.",
    cumpleNormasSismoresistencia: true,
    riesgosEvidentesHabitabilidad: true,
    riesgosEvidentesHabitabilidadDescription: "Humedad en el sótano debido a filtraciones menores.",
    seguros_obligatorios_recomendables: "Sí",
    cuentaPolizaSeguroVigente: true,

    // Sección G: Aspectos Legales y Documentales
    documento_certificado_tradicion_libertad: true,
    documento_escritura_publica: true,
    documento_recibo_impuesto_predial: true,
    documento_paz_salvo_administracion: true,
    documento_reglamento_ph: true,
    documentos_otros: "Ninguno",

    // Sección H: Declaraciones Adicionales
    legal_declarations: {
      declaracion_veracidad: true,
      entendimiento_alcance_analisis: true,
      declaracion_propiedad_exclusiva: true,
      declaracion_uso_previsto: true,
      declaracion_cumplimiento_normas: true,
      declaracion_sin_litigios: true,
      declaracion_servidumbres: true,
      declaracion_sin_afectaciones: true,
      declaracion_impuestos_pagados: true,
      declaracion_sin_deudas_asociacion: true,
      declaracion_informacion_completa: true,
      informacionVerazCompleta: true,
      entendimientoAnalisisLegal: true,
      autorizacionTratamientoDatos: true,
    },

    // Otros campos
    expectedValue: 1500000,
    images: [], // No se pueden pre-llenar archivos File directamente
    admin_fee: 200000,
  };
};
