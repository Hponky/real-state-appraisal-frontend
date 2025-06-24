import { AppraisalFormData, AppraisalResult, MaterialQualityEntry } from '../appraisal/types/appraisal-results';
import { SupabaseClient } from '@supabase/supabase-js';

type ApiClientOptions = {
   method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
   headers?: HeadersInit;
   body?: any;
   accessToken?: string | null;
   responseType?: 'json' | 'blob' | 'text';
};

const apiClient = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> => {
   const {
       method = 'GET',
       headers: customHeaders = {},
       body,
       accessToken,
       responseType = 'json',
   } = options;

   const headers = new Headers(customHeaders);

   if (!headers.has('Content-Type')) {
       headers.set('Content-Type', 'application/json');
   }

   if (accessToken) {
       headers.set('Authorization', `Bearer ${accessToken}`);
   }

   const config: RequestInit = {
       method,
       headers,
   };

   if (body) {
       config.body = JSON.stringify(body);
   }

   try {
       const response = await fetch(endpoint, config);

       if (!response.ok) {
           let errorData;
           try {
               // Intenta parsear el error como JSON, que es el formato más común
               const jsonError = await response.json();
               errorData = jsonError.message || JSON.stringify(jsonError);
           } catch (e) {
               // Si falla, lee el error como texto plano
               errorData = await response.text();
           }
           // Lanza un error estandarizado
           throw new Error(`Error ${response.status}: ${errorData || 'Ocurrió un error en el servidor'}`);
       }

       // Maneja diferentes tipos de respuesta según lo especificado
       if (responseType === 'blob') {
           return response.blob() as Promise<T>;
       }
       if (responseType === 'text') {
           return response.text() as Promise<T>;
       }
       // Por defecto, o si se especifica 'json', parsea como JSON
       // Si la respuesta no tiene cuerpo (ej. 204 No Content), `response.json()` puede fallar.
       const text = await response.text();
       return text ? JSON.parse(text) : ({} as T);

   } catch (error) {
       // Captura errores de red u otros problemas con el fetch
       console.error(`API Client Error (${method} ${endpoint}):`, error);
       // Re-lanza el error para que el código que llama pueda manejarlo
       throw error;
   }
};


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
       const requestBody = {
           requestId: requestId,
           formData: payload,
       };
       // El endpoint de n8n no devuelve contenido en caso de éxito
       await apiClient<void>('/api/n8n/recepcion-datos-inmueble', {
           method: 'POST',
           body: requestBody,
           accessToken,
           responseType: 'text', // Esperamos texto o nada, no JSON
       });
   },

   getAppraisalHistory: async (accessToken: string): Promise<any[]> => {
       return apiClient<any[]>('/api/appraisal/history', {
           accessToken,
       });
   },

   downloadPdf: async (appraisalId: string, accessToken: string, filename: string = `resultados-peritaje-${appraisalId}.pdf`): Promise<void> => {
       const blob = await apiClient<Blob>(`/api/appraisal/download-pdf?appraisalId=${appraisalId}`, {
           accessToken,
           responseType: 'blob',
       });

       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       a.remove();
       window.URL.revokeObjectURL(url);
   },

   saveAppraisalResult: async (appraisalResult: AppraisalResult, userId: string | null, accessToken: string): Promise<void> => {
       const requestBody = {
           appraisalData: {
               form_data: appraisalResult.form_data,
               result_data: appraisalResult.result_data,
           },
           userId: userId,
       };
       await apiClient<void>('/api/appraisal/save-result', {
           method: 'POST',
           body: requestBody,
           accessToken,
       });
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
       await apiClient<void>('/api/appraisal/associate-user', {
           method: 'POST',
           body: { anonymousSessionId, userId },
       });
   },
};
