import {
  AppraisalFormData,
  PotRestriction,
  ZonaDeclaratoriaEspecial,
  LegalDeclarations,
  MaterialQualityEntry,
  InformacionBasica,
  RangoArriendoReferenciasCop,
  AnalisisMercadoArriendo,
  ValoracionArriendoActual,
  MejoraConImpactoDetallado,
  PotencialValorizacionArriendo,
  AnalisisLegalArrendamiento,
} from '../appraisal-results';

describe('ZonaDeclaratoriaEspecial Interface', () => {
  it('should correctly type a zona declaratoria especial object', () => {
    const zonaDeclaratoria: ZonaDeclaratoriaEspecial = {
      aplica: true,
      tipo: "Histórica (Bien de Interés Cultural - BIC)",
      restricciones_comunes: ["Protección del patrimonio arquitectónico"],
      restricciones_comunes_descripcion: "Descripción de restricciones comunes.",
      otras_restricciones_seleccion: "Sí, especificar",
      otras_restricciones_descripcion: "Otras restricciones específicas.",
      fuente: "Decreto 123 de 2020",
      declaratoriaImponeObligaciones: true
    };
    expect(zonaDeclaratoria.aplica).toBe(true);
    expect(zonaDeclaratoria.tipo).toBe("Histórica (Bien de Interés Cultural - BIC)");
    expect(zonaDeclaratoria.restricciones_comunes).toContain("Protección del patrimonio arquitectónico");
  });
});

describe('LegalDeclarations Interface', () => {
  it('should correctly type a legal declarations object', () => {
    const legalDeclarations: LegalDeclarations = {
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
      autorizacionTratamientoDatos: true
    };
    expect(legalDeclarations.declaracion_veracidad).toBe(true);
    expect(legalDeclarations.informacionVerazCompleta).toBe(true);
  });
});

describe('MaterialQualityEntry Interface', () => {
  it('should correctly type a material quality entry object', () => {
    const materialQualityEntry: MaterialQualityEntry = {
      material: "Madera",
      quality: "Alta",
      description: "Pisos de madera maciza."
    };
    expect(materialQualityEntry.material).toBe("Madera");
    expect(materialQualityEntry.quality).toBe("Alta");
  });
});

describe('AppraisalFormData Interface', () => {
  it('should correctly type a AppraisalFormData object', () => {
    const formData: AppraisalFormData = {
      requestId: "d608e88a-1950-422c-8242-bd5c04029cef",
      department: "Caldas",
      city: "Manizales",
      address: "Calle 123 #45-67",
      built_area: 80,
      documento_ficha_predial_catastral: true,
      property_type: "Casa",
      estrato: "4",
      pot_restriccion_uso_suelo: { selected: true, description: "Uso residencial permitido." },
      pot_restriccion_edificabilidad: { selected: true, description: "Restricción de edificabilidad." },
      pot_restriccion_altura: { selected: true, description: "Altura máxima." },
      pot_afectacion_via_publica: { selected: true, description: "Afectación vía pública." },
      pot_afectacion_ronda_hidrica: { selected: true, description: "Afectación ronda hídrica." },
      pot_afectacion_infraestructura_servicios_publicos: { selected: true, description: "Afectación servicios públicos." },
      pot_otra_restriccion_pot: { selected: true, description: "Otra restricción POT." },
      zona_declaratoria_especial: {
        aplica: true,
        tipo: "Histórica",
        restricciones_comunes: ["Patrimonio"],
        restricciones_comunes_descripcion: "Desc. comunes.",
        otras_restricciones_seleccion: "No",
        otras_restricciones_descripcion: "",
        fuente: "Fuente",
        declaratoriaImponeObligaciones: true
      },
      gravamenes_cargas_seleccionados: ["hipoteca"],
      gravamenes_cargas_otros: "Otros gravámenes.",
      litigios_proceso_judicial_seleccionados: ["demanda_propiedad"],
      litigios_proceso_judicial_otros: "Otros litigios.",
      documento_certificado_tradicion_libertad: true,
      documento_escritura_publica: true,
      documento_recibo_impuesto_predial: true,
      documento_paz_salvo_administracion: true,
      documento_reglamento_ph: true,
      documentos_otros: "Otros documentos.",
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
        autorizacionTratamientoDatos: true
      },
      expectedValue: 1000000,
      ph_aplica: true,
      ph_sometido_ley_675: true,
      ph_reglamento_interno: true,
      ph_reglamento_cubre_aspectos: true,
      ph_escritura_registrada: true,
      ph_tipo_propiedad: "Apartamento",
      ph_nombre_conjunto: "Conjunto A",
      ph_nit_copropiedad: "123456789-0",
      ph_restriccion_arrendamiento: "Ninguna",
      ph_cuotas_pendientes: "No",
      ph_normativa_interna: "Sí",
      impuestoPredialAlDia: true,
      reglamentoPropiedadHorizontalInscrito: true,
      deudasCuotasAdministracion: false,
      pot_otras_restricciones_descripcion: "Desc. otras restricciones POT.",
      contrato_escrito_vigente: "Sí",
      preferencia_requisito_futuro_contrato: "No",
      responsable_servicios_publicos: "Propietario",
      gravamen_hipoteca_description: "Desc. hipoteca.",
      gravamen_embargo_description: "Desc. embargo.",
      gravamen_servidumbre_description: "Desc. servidumbre.",
      gravamen_prenda_description: "Desc. prenda.",
      gravamen_usufructo_description: "Desc. usufructo.",
      litigio_demanda_propiedad_description: "Desc. demanda propiedad.",
      litigio_proceso_sucesion_description: "Desc. proceso sucesión.",
      litigio_disputa_linderos_description: "Desc. disputa linderos.",
      litigio_ejecucion_hipotecaria_description: "Desc. ejecución hipotecaria.",
      acceso_servicios_publicos: "Todos",
      serviciosConectadosFuncionando: true,
      deudasServiciosPublicos: false,
      condiciones_seguridad_salubridad: "Buenas",
      cumpleNormasSismoresistencia: true,
      riesgosEvidentesHabitabilidad: false,
      riesgosEvidentesHabitabilidadDescription: "",
      seguros_obligatorios_recomendables: true,
      cuentaPolizaSeguroVigente: true,
      admin_fee: 150000,
      imagesBase64: [],
      materialQualityEntries: []
    };
    expect(formData.department).toBe("Caldas");
    expect(formData.expectedValue).toBe(1000000);
  });
});