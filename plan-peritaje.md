# Plan de Desarrollo: Flujo Formulario -> API (Iniciar) -> n8n -> API (Recibir y Guardar en DB) -> Frontend (Polling DB) -> Redirección -> Página de Resultados (Leer de DB)

Este plan detalla los pasos implementados para lograr un flujo donde el usuario envía un formulario, se activa un proceso en n8n, los resultados de n8n se guardan en Supabase, y el frontend espera por estos resultados (consultando Supabase) para luego redirigir al usuario a la página de resultados y mostrarlos (leyendo también de Supabase).

## Objetivo

Lograr que, al enviar el formulario en `/appraisal`, el navegador del usuario sea redirigido automáticamente a `/appraisal/results` una vez que n8n haya procesado la información y enviado los resultados a la API, mostrando dichos resultados en la página de destino obtenidos desde Supabase.

## Pasos Implementados

1.  **Modificar `app/api/appraisal/receive/route.ts`:**
    *   Se eliminó la lógica de redirección HTTP.
    *   Se configuró este endpoint para recibir la petición POST de n8n con los resultados del peritaje y el ID de solicitud original.
    *   Se extrajeron los datos del peritaje y el ID de solicitud del cuerpo de la petición.
    *   Se utilizó el cliente de Supabase (`@/lib/supabase`) para actualizar la entrada correspondiente en la tabla `appraisals` con los resultados del peritaje y marcarla como 'completed'.
    *   Se configuró para responder a n8n con un estado HTTP 200 OK.

2.  **Crear un nuevo endpoint de API: `app/api/appraisal/initiate/route.ts`:**
    *   Este endpoint manejará la petición POST inicial enviada desde el formulario en el frontend (`app/appraisal/page.tsx`).
    *   Generará un ID único para cada solicitud de peritaje.
    *   Utilizará el cliente de Supabase para insertar una nueva entrada en la base de datos con este ID y un estado inicial ('pending').
    *   Activa el flujo de n8n (llamando a un webhook de n8n), pasando los datos del formulario y el ID de solicitud generado.
    *   Responde al frontend con el ID de solicitud. (Este paso fue planificado pero la implementación se integró en `useAppraisalSubmission.ts` y `appraisalApiService.ts` según el flujo existente).

3.  **Crear un nuevo endpoint de API: `app/api/appraisal/status/route.ts`:**
    *   Este endpoint responde a peticiones GET desde el frontend.
    *   Recibe el ID de solicitud como parámetro de consulta en la URL.
    *   Utiliza el cliente de Supabase para consultar la base de datos por la entrada asociada a ese ID.
    *   Si los resultados existen y están marcados como 'completed', responde con un estado HTTP 200 OK y los datos del peritaje.
    *   Si la entrada existe pero está 'pending', responde con un estado HTTP 202 Accepted.
    *   Si la entrada no existe, responde con un error 404 Not Found.

4.  **Modificar la página del formulario: `app/appraisal/page.tsx` (específicamente `useAppraisalSubmission.ts`):**
    *   Se modificó la función que maneja el envío del formulario.
    *   Ahora genera el ID de solicitud único.
    *   Crea la entrada inicial 'pending' en Supabase.
    *   Llama a `appraisalApiService.submitAppraisal`, pasando el ID de solicitud y los datos del formulario (incluyendo imágenes Base64) a n8n.
    *   Implementa un mecanismo de polling para llamar periódicamente al endpoint `/api/appraisal/status` con el ID.
    *   Muestra un estado de carga mientras espera.
    *   Cuando `/api/appraisal/status` devuelve los resultados completos, detiene el polling y redirige al usuario a `/appraisal/results`, pasando el ID de solicitud en la URL.
    *   Incluye manejo de errores y timeouts.

5.  **Modificar la página de resultados: `app/appraisal/results/page.tsx`:**
    *   Se modificó la lógica para leer el ID de solicitud del parámetro de consulta de la URL (`id`).
    *   Utiliza el hook `useEffect` para, una vez montado el componente, obtener los resultados del peritaje asociados a este ID desde Supabase a través del endpoint `/api/appraisal/status`.
    *   Muestra los datos del peritaje obtenidos en formato JSON crudo.
    *   Maneja estados de carga y error.

6.  **Configuración de n8n:**
    *   (Paso pendiente de configuración manual) Asegurarse de que el flujo de n8n reciba el ID de solicitud del frontend (a través de la llamada de `appraisalApiService.submitAppraisal`).
    *   (Paso pendiente de configuración manual) Asegurarse de que el flujo de n8n, después de procesar la información, realice una petición POST a la ruta `/api/appraisal/receive`, incluyendo los resultados del peritaje y el ID de solicitud original.

## Diagrama del Flujo Implementado

```mermaid
graph TD
    A[Usuario en /appraisal] --> B{Envío de Formulario};
    B --> C[Frontend (useAppraisalSubmission) Generates ID];
    C --> D[Frontend Inserts Pending Entry in DB (Supabase) with ID];
    D --> E[Frontend Calls appraisalApiService.submitAppraisal with ID and Form Data];
    E --> F[appraisalApiService Calls n8n Webhook with ID and Form Data];
    F --> G[n8n Processes Data];
    G --> H[n8n POST to /api/appraisal/receive with Results and ID];
    H --> I{API Route /api/appraisal/receive};
    I --> J[Update DB Entry (Supabase) with Results and Mark Complete];
    J --> K[Respond to n8n (e.g., 200 OK)];
    E --> L[Frontend (on /appraisal) Starts Polling /api/appraisal/status with ID];
    L --> M{API Route /api/appraisal/status};
    M --> N{Query DB (Supabase) for Results by ID};
    N -->|Results Found (Complete)| O[API /status Responds with Results];
    N -->|Entry Pending| P[API /status Responds Pending];
    N -->|Entry Not Found| Q[API /status Responds Error];
    P --> L; %% Continue Polling
    O --> R[Frontend Receives Results];
    R --> S[Frontend Redirects to /appraisal/results?id=REQUEST_ID];
    S --> T[Browser on /appraisal/results];
    T --> U[Read ID from URL Params];
    U --> V[Frontend Fetches Results from DB (Supabase) via /api/appraisal/status by ID];
    V --> W[Display Data on Page];
```

Este documento refleja el estado actual de la implementación basada en el plan acordado y las modificaciones realizadas.