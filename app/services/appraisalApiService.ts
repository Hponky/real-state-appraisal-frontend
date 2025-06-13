import { AppraisalFormData, AppraisalResult } from '../appraisal/types/appraisal-results';

export const appraisalApiService = {
    submitAppraisal: async (requestId: string, formData: AppraisalFormData): Promise<void> => { // Aceptar requestId, formData y accessToken
        try {
            const requestBody = {
                requestId: requestId,
                formData: formData,
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

   downloadPdf: async (appraisalData: AppraisalResult, accessToken: string): Promise<Blob> => {
     try {
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
       throw error;
     }
   },

   saveAppraisalResult: async (appraisalData: AppraisalFormData, userId: string | null, accessToken: string): Promise<void> => {
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
       throw error;
     }
   },
};
