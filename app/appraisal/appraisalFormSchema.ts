import { z } from 'zod';

// Schema for a single MaterialQualityEntry
const materialQualityEntrySchema = z.object({
  id: z.string(), // Assuming ID is generated and present
  location: z.string().min(1, "Ingrese la ubicación"),
  qualityDescription: z.string().min(1, "Ingrese la descripción de calidad"),
});

// Schema for the main form data
export const appraisalFormSchema = z.object({
  department: z.string().min(1, "Seleccione un departamento"),
  city: z.string().min(1, "Seleccione una ciudad"),
  address: z.string().min(1, "Ingrese una dirección válida"),
  area: z.preprocess( // Use preprocess to handle empty string or non-numeric input
    (val) => (val === '' ? null : Number(val)),
    z.nullable(z.number().positive("Ingrese un área numérica positiva")).optional()
  ),
  stratum: z.string().min(1, "Seleccione un estrato"),
  adminFee: z.preprocess( // Use preprocess to handle empty string or non-numeric input
    (val) => (val === '' ? null : Number(val)),
    z.nullable(z.number().nonnegative("Ingrese una administración numérica no negativa")).optional()
  ),
  expectedValue: z.preprocess( // Use preprocess to handle empty string or non-numeric input
    (val) => (val === '' ? null : Number(val)),
    z.number({
        required_error: "Ingrese el valor esperado",
        invalid_type_error: "Ingrese un valor numérico para el valor esperado"
    }).positive("Ingrese un valor numérico positivo para el valor esperado")
  ),
  propertyType: z.string().min(1, "Seleccione el tipo de inmueble"),
  // Validate the array of material quality entries
  materialQualityEntries: z.array(materialQualityEntrySchema).optional(),
  // Validation for images will be handled separately in the hook,
  // but we can add a placeholder or minimum check here if needed.
  // For now, we'll rely on the hook's imageErrors state.
});

// Define the type based on the schema
export type AppraisalFormData = z.infer<typeof appraisalFormSchema>;