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

            console.log("Calling n8n webhook with URL:", 'http://localhost:5678/webhook-test/recepcion-datos-inmueble'); // Log antes de fetch
            try {
                const response = await fetch('http://localhost:5678/webhook-test/recepcion-datos-inmueble', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Enviar como JSON
                    },
                    body: JSON.stringify(requestBody), // Enviar el cuerpo como JSON string
                });

                console.log("n8n webhook fetch response received.", { status: response.status, ok: response.ok }); // Log después de fetch

                if (!response.ok) {
                let errorData = 'Unknown server error';
                try {
                    const jsonError = await response.json();
                    errorData = jsonError.message || JSON.stringify(jsonError);
                } catch (parseError) {
                    errorData = await response.text();
                }
                console.error("Server response error:", response.status, errorData);
                throw new Error(`Error ${response.status}: ${errorData}`);
            }

            // Assuming success does not return a specific body needed by the hook
           } catch (error) {
               console.error("Error during n8n webhook fetch:", error); // Log de error en fetch
               throw error; // Re-throw to be caught by the hook
           }
       } catch (error) {
           console.error("Error submitting form to n8n (general catch):", error); // Log de error general
           throw error; // Re-throw to be caught by the hook
       }
   }
};