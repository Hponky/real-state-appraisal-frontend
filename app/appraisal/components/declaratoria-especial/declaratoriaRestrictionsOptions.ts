export const declaratoriaRestrictionsOptions: Record<string, { label: string; hint: string; options: string[] }> = {
  'Histórica (Bien de Interés Cultural - BIC)': {
    label: 'Restricciones Comunes (Histórica)',
    hint: 'Selecciona las restricciones típicas para Bienes de Interés Cultural que apliquen. Consulta la normativa específica (Ley 1185 de 2008, Decreto 1080 de 2015, normativas municipales) para confirmar.',
    options: [
      'Protección del patrimonio arquitectónico',
      'Normas de intervención',
      'Uso del suelo específico',
      'Regulación de publicidad y fachadas',
    ],
  },
  'Cultural': {
    label: 'Restricciones Comunes (Cultural)',
    hint: 'Selecciona las restricciones típicas para zonas con declaratoria cultural que apliquen. Consulta la normativa específica para confirmar.',
    options: [
      'Protección de elementos culturales',
      'Normas de intervención para preservar el carácter cultural',
      'Uso del suelo compatible con la actividad cultural',
      'Regulación de actividades que puedan afectar el entorno cultural',
    ],
  },
  'Ambiental': {
    label: 'Restricciones Comunes (Ambiental)',
    hint: 'Selecciona las restricciones típicas para zonas con declaratoria ambiental que apliquen. Consulta la normativa específica para confirmar.',
    options: [
      'Restricciones de construcción en zonas de protección ambiental',
      'Normas para la conservación de ecosistemas',
      'Regulación de actividades que generen impacto ambiental',
      'Uso del suelo compatible con la sostenibilidad ambiental',
    ],
  },
  'De Riesgo': {
    label: 'Restricciones Comunes (De Riesgo)',
    hint: 'Selecciona las restricciones típicas para zonas de riesgo que apliquen. Consulta la normativa específica para confirmar.',
    options: [
      'Restricciones de construcción en zonas de alto riesgo',
      'Medidas de mitigación de riesgos',
      'Prohibición de ciertos usos del suelo',
      'Planes de evacuación o contingencia',
    ],
  },
};