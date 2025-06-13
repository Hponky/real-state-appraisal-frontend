import { AppraisalFormData, AppraisalResult, MaterialQualityEntry } from '../appraisal/types/appraisal-results';

// Define the payload structure for the submission to n8n
export interface AppraisalSubmissionPayload extends Partial<Omit<AppraisalFormData, 'images'>> {
  requestId: string;
  department: string; // Add department back to root
  city: string;       // Add city back to root
  address: string;    // Add address back to root
  imagesBase64: string[];
  materialQualityEntries: MaterialQualityEntry[];
}

export const appraisalApiService = {
    submitAppraisal: async (requestId: string, payload: AppraisalSubmissionPayload): Promise<void> => {
        try {
            const requestBody = {
                requestId: requestId,
                formData: payload, // Now sending the constructed payload
            };

            const n8nWebhookUrl = '/api/n8n/recepcion-datos-inmueble'; // Usar la ruta local proxied y especificar el nombre del webhook
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Enviar como JSON
                    },
                    body: JSON.stringify(requestBody), // Enviar el cuerpo como JSON string
                });

                if (!response.ok) {
                const errorBody = await response.text(); // Leer el cuerpo una sola vez como texto
                let errorData: string;
                try {
                    const jsonError = JSON.parse(errorBody);
                    errorData = JSON.stringify(jsonError); // Always stringify the full JSON object if parsing succeeds
                } catch (parseError) {
                    errorData = errorBody || 'Unknown server error'; // Fallback to raw text if parsing fails
                }
                console.error("DEBUG: Server response error:", response.status, errorData); // Log de error de respuesta
                throw new Error(`Error ${response.status}: ${errorData}`);
            }

            console.log("DEBUG: n8n webhook call successful."); // Log de éxito

            // Assuming success does not return a specific body needed by the hook
           } catch (error) {
               console.error("DEBUG: Error during n8n webhook fetch:", error); // Log de error en fetch
               throw error; // Re-throw to be caught by the hook
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
           initial_data: appraisalResult.initial_data,
           appraisal_data: appraisalResult.appraisal_data,
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
};
