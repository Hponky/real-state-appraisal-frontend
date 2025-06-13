import { AppraisalResult } from "@/app/appraisal/types/appraisal-results";

export const appraisalApiService = {
    submitAppraisal: async (requestId: string, formData: any): Promise<void> => { // Aceptar requestId, formData y accessToken
        try {
            const requestBody = {
                requestId: requestId,
                formData: formData,
            };

            const n8nWebhookUrl = '/api/n8n/recepcion-datos-inmueble'; // Usar la ruta local proxied y especificar el nombre del webhook
            ("DEBUG: Calling n8n webhook with URL:", n8nWebhookUrl); // Log antes de fetch
            ("DEBUG: n8n webhook request body:", JSON.stringify(requestBody, null, 2)); // Log del cuerpo de la petición
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Enviar como JSON
                    },
                    body: JSON.stringify(requestBody), // Enviar el cuerpo como JSON string
                });

                ("DEBUG: n8n webhook fetch response received.", { status: response.status, ok: response.ok }); // Log después de fetch
                if (!response.ok) {
                const errorBody = await response.text(); // Leer el cuerpo una sola vez como texto
                let errorData = errorBody || 'Unknown server error';
                try {
                    // Intentar parsear como JSON si parece JSON
                    const jsonError = JSON.parse(errorBody);
                    errorData = jsonError.message || JSON.stringify(jsonError);
                } catch (parseError) {
                    // Si falla el parseo, usar el texto crudo
                    // errorData ya contiene el texto crudo
                }
                console.error("DEBUG: Server response error:", response.status, errorData); // Log de error de respuesta
                throw new Error(`Error ${response.status}: ${errorData}`);
            }

            ("DEBUG: n8n webhook call successful."); // Log de éxito

            // Assuming success does not return a specific body needed by the hook
           } catch (error) {
               console.error("DEBUG: Error during n8n webhook fetch:", error); // Log de error en fetch
               throw error; // Re-throw to be caught by the hook
           }
       } catch (error) {
           console.error("DEBUG: Error submitting form to n8n (general catch):", error); // Log de error general
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
       console.error("Error fetching appraisal history:", error);
       throw error;
     }
   },

   downloadPdf: async (appraisalData: AppraisalResult | null, accessToken: string): Promise<Blob> => {
     try {
       ("DEBUG: Sending appraisalData for PDF download:", JSON.stringify(appraisalData, null, 2));
       const response = await fetch('/api/appraisal/download-pdf', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}`,
         },
         body: JSON.stringify(appraisalData),
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Error al descargar el PDF.');
       }

       return response.blob();
     } catch (error) {
       console.error("Error downloading PDF:", error);
       throw error;
     }
   },

   saveAppraisalResult: async (appraisalData: AppraisalResult | null, userId: string | null, accessToken: string): Promise<void> => {
     try {
       const requestBody = {
         appraisalData: appraisalData,
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
       console.error("Error saving appraisal result:", error);
       throw error;
     }
   },
};
