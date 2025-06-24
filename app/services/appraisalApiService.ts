import { AppraisalFormData, AppraisalResult, MaterialQualityEntry } from '../appraisal/types/appraisal-results';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the payload structure for the submission to n8n
export interface AppraisalSubmissionPayload extends Partial<Omit<AppraisalFormData, 'images'>> {
  requestId: string;
  department: string; // Add department back to root
  city: string;       // Add city back to root
  address: string;    // Add address back to root
  imagesBase64: string[];
  materialQualityEntries: MaterialQualityEntry[];
  userId?: string; // Añadir userId opcional para peritajes anónimos
}

export const appraisalApiService = {
    submitAppraisal: async (requestId: string, payload: AppraisalSubmissionPayload, accessToken: string | null = null): Promise<void> => {
        try {
            const requestBody = {
                requestId: requestId,
                formData: payload, // Now sending the constructed payload
            };

            const headers: HeadersInit = {
                'Content-Type': 'application/json', // Enviar como JSON
            };

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const n8nWebhookUrl = '/api/n8n/recepcion-datos-inmueble'; // Usar la ruta local proxied y especificar el nombre del webhook
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestBody), // Enviar el cuerpo como JSON string
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('El servicio de peritaje no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.');
                    }
                    const errorBody = await response.text(); // Leer el cuerpo una sola vez como texto
                    let errorData: string;
                    try {
                        const jsonError = JSON.parse(errorBody);
                        errorData = JSON.stringify(jsonError); // Always stringify the full JSON object if parsing succeeds
                    } catch (parseError) {
                        errorData = errorBody || 'Unknown server error'; // Fallback to raw text if parsing fails
                    }
                    throw new Error(`Error ${response.status}: ${errorData}`);
                }

            // Assuming success does not return a specific body needed by the hook
           } catch (error) {
               // Si el fetch mismo falla (ej. error de red), es una indicación de que el servicio no está disponible.
               // El error 404 se maneja arriba. Este catch es para errores de red.
               throw new Error('El servicio de peritaje no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.');
           }
       } catch (error) {
           throw error; // Re-throw to be caught by the hook
       
   }
   },

   getAppraisalHistory: async (accessToken: string): Promise<any[]> => {
     try {
       const response = await fetch('/api/appraisal/history', {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}`,
         },
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Error al obtener el historial de peritajes.');
       }

       return response.json();
     } catch (error) {
       throw error;
     }
   },

   downloadPdf: async (appraisalId: string, accessToken: string, filename: string = `resultados-peritaje-${appraisalId}.pdf`): Promise<void> => {
     try {
       const response = await fetch(`/api/appraisal/download-pdf?appraisalId=${appraisalId}`, {
         method: 'GET',
         headers: {
           'Authorization': `Bearer ${accessToken}`,
         },
       });
 
       if (!response.ok) {
         const errorBody = await response.text();
         let errorData: string;
         try {
           const jsonError = JSON.parse(errorBody);
           errorData = jsonError.message || JSON.stringify(jsonError);
         } catch (parseError) {
           errorData = errorBody || 'Error desconocido al descargar el PDF.';
         }
         throw new Error(`Error ${response.status}: ${errorData}`);
       }
 
       const blob = await response.blob();
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       a.remove();
       window.URL.revokeObjectURL(url);
     } catch (error) {
       console.error("Error al descargar el PDF:", error);
       throw error;
     }
   },

   saveAppraisalResult: async (appraisalResult: AppraisalResult, userId: string | null, accessToken: string): Promise<void> => {
     try {
       const requestBody = {
         appraisalData: {
           form_data: appraisalResult.form_data,
           result_data: appraisalResult.result_data,
         },
         userId: userId,
       };

       const response = await fetch('/api/appraisal/save-result', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}`,
         },
         body: JSON.stringify(requestBody),
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Error al guardar el resultado del peritaje.');
       }
     } catch (error) {
       throw error;
     }
   },

  getAnonymousAppraisals: async (supabaseClient: SupabaseClient, anonymousSessionId: string): Promise<AppraisalResult[]> => {
    const { data, error } = await supabaseClient.rpc('get_anonymous_appraisals', {
      anonymous_id: anonymousSessionId,
    });

    if (error) {
      console.error("Error fetching anonymous appraisals:", error);
      throw new Error("No se pudo obtener el historial anónimo.");
    }
    return data as AppraisalResult[];
   },

   associateAnonymousAppraisals: async (anonymousSessionId: string, userId: string): Promise<void> => {
    try {
        const response = await fetch('/api/appraisal/associate-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ anonymousSessionId, userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al asociar los peritajes.');
        }
    } catch (error) {
        console.error("Error al asociar peritajes con usuario:", error);
        throw error;
    }
   },
};
