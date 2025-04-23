export const appraisalApiService = {
    submitAppraisal: async (formData: FormData): Promise<void> => {
        try {
            const response = await fetch('http://localhost:5678/webhook-test/recepcion-datos-inmueble', {
                method: 'POST',
                body: formData,
            });

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
            console.error("Error submitting form:", error);
            throw error; // Re-throw to be caught by the hook
        }
    }
};