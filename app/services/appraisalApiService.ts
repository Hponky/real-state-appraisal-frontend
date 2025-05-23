export const appraisalApiService = {
    submitAppraisal: async (requestId: string, formData: any): Promise<void> => { // Aceptar requestId y formData como objeto
        try {
            // Convertir FormData a un objeto JSON si es necesario, o ajustar n8n para recibir FormData
            // Para simplificar, asumiremos que formData ya es un objeto o se puede convertir fácilmente
            // Si formData es una instancia de FormData, necesitarás procesarla.
            // Ejemplo simple si formData es un objeto:
            const requestBody = {
                requestId: requestId,
                formData: formData,
            };

            const n8nWebhookUrl = '/api/n8n'; // Usar la ruta local proxied
            console.log("DEBUG: Calling n8n webhook with URL:", n8nWebhookUrl); // Log antes de fetch
            console.log("DEBUG: n8n webhook request body:", JSON.stringify(requestBody, null, 2)); // Log del cuerpo de la petición
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Enviar como JSON
                    },
                    body: JSON.stringify(requestBody), // Enviar el cuerpo como JSON string
                });

                console.log("DEBUG: n8n webhook fetch response received.", { status: response.status, ok: response.ok }); // Log después de fetch
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

            console.log("DEBUG: n8n webhook call successful."); // Log de éxito

            // Assuming success does not return a specific body needed by the hook
           } catch (error) {
               console.error("DEBUG: Error during n8n webhook fetch:", error); // Log de error en fetch
               throw error; // Re-throw to be caught by the hook
           }
       } catch (error) {
           console.error("DEBUG: Error submitting form to n8n (general catch):", error); // Log de error general
           throw error; // Re-throw to be caught by the hook
       
   }
   }
};