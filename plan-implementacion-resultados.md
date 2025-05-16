# Plan de Implementación: Redirección y Visualización de Resultados del Peritaje

Este plan detalla los pasos para asegurar que el usuario sea redirigido a la página de resultados una vez completado el peritaje por n8n y que los datos del peritaje estén disponibles y se muestren en esa página, considerando el manejo del caché de Supabase.

## Objetivo

Lograr que, tras el envío exitoso del formulario y la actualización de Supabase por n8n, el usuario sea redirigido automáticamente a `/appraisal/results` y vea los datos del peritaje cargados desde Supabase.

## Contexto Existente

*   El formulario en `/appraisal` utiliza el hook `useAppraisalSubmission.ts` para manejar el envío.
*   `useAppraisalSubmission.ts` inicia la inserción en Supabase (sin `await`), llama al webhook de n8n y luego inicia un mecanismo de polling al endpoint `/api/appraisal/status`.
*   El endpoint `/api/appraisal/status` consulta Supabase por el estado del peritaje usando el `id` proporcionado.
*   El endpoint `/api/appraisal/receive` (llamado por n8n) actualiza la entrada en Supabase con los resultados y cambia el estado a 'completed', utilizando la clave de rol de servicio para omitir RLS.
*   La página de resultados `app/appraisal/results/page.tsx` lee el `id` de la URL y llama a `/api/appraisal/status` para obtener los datos.
*   Actualmente, `app/appraisal/results/page.tsx` muestra los datos recibidos como JSON crudo.

## Pasos del Plan

1.  **Verificar el Flujo Completo de Redirección:**
    *   **Acción:** Envía un formulario completo desde `/appraisal`.
    *   **Verificación:** Observa la consola del navegador para confirmar que el polling en `useAppraisalSubmission.ts` detecta el estado 'completed' (llamando a `/api/appraisal/status`) y que el navegador es redirigido automáticamente a la URL `/appraisal/results?id=...` con el ID de solicitud correcto.
    *   **Ajuste (si es necesario):** Si la redirección no ocurre, revisa la lógica de polling y redirección en `useAppraisalSubmission.ts` para asegurar que maneje correctamente la respuesta 'completed' del endpoint `/api/appraisal/status`.

2.  **Confirmar la Carga de Datos en la Página de Resultados:**
    *   **Acción:** Una vez redirigido a `/appraisal/results?id=...`, observa la consola del navegador.
    *   **Verificación:** Confirma que la página `app/appraisal/results/page.tsx` lee el `id` de la URL y realiza una llamada al endpoint `/api/appraisal/status` con ese ID. Verifica que la respuesta de `/api/appraisal/status` contenga los datos del peritaje actualizados (el objeto completo que n8n envió, almacenado en `initial_data`).
    *   **Ajuste (si es necesario):** Si la llamada a `/api/appraisal/status` desde la página de resultados falla o no devuelve los datos esperados, revisa la implementación de `useEffect` en `app/appraisal/results/page.tsx` y la lógica del endpoint `/api/appraisal/status`.

3.  **Acceder y Formatear los Datos del Peritaje en la Página de Resultados:**
    *   **Acción:** Modifica el componente `app/appraisal/results/page.tsx`.
    *   **Implementación:** En lugar de mostrar `JSON.stringify(appraisalData, null, 2)`, accede a las propiedades específicas dentro de `appraisalData.initial_data` (que contiene el objeto completo enviado por n8n) y renderiza la información de manera estructurada y legible (ej. mostrando el rango de mercado, observaciones técnicas, etc.).
    *   **Verificación:** Envía un formulario y verifica que la página de resultados muestre los datos del peritaje formateados correctamente.

4.  **Considerar el Caché de Supabase:**
    *   **Importancia:** El cliente de Supabase puede cachear respuestas. Es crucial que la página de resultados obtenga los datos más recientes después de que n8n los actualice.
    *   **Manejo Actual:** El endpoint `/api/appraisal/status` consulta directamente la base de datos en cada petición, lo que ayuda a mitigar el caché a nivel del backend. La llamada `fetch` en la página de resultados por defecto puede usar caché del navegador o de la librería.
    *   **Verificación:** En la pestaña Network del navegador, verifica que la llamada a `/api/appraisal/status` desde la página de resultados no esté sirviéndose desde caché obsoleto.
    *   **Ajuste (si es necesario):** Si observas que la página de resultados muestra datos antiguos debido al caché, puedes modificar la llamada `fetch` en `app/appraisal/results/page.tsx` para incluir opciones que fuercen la no-cache, como `cache: 'no-store'` o añadiendo un query parameter único (ej. timestamp) a la URL de la petición.

## Diagrama del Flujo (Actualizado)

```mermaid
graph TD
    A[Usuario en /appraisal] --> B{Envío de Formulario};
    B --> C[Frontend (useAppraisalSubmission) Inicia Inserción en DB (sin await)];
    C --> D[Frontend Llama a appraisalApiService.submitAppraisal];
    D --> E[appraisalApiService Llama a n8n Webhook];
    E --> F[n8n Procesa Datos];
    F --> G[n8n POST a /api/appraisal/receive];
    G --> H{API Route /api/appraisal/receive (Usa Service Role Key)};
    H --> I[Actualiza DB Entry (Supabase) con Resultados y Marca Complete];
    I --> J[Responde a n8n (200 OK)];
    C --> K[Frontend (en /appraisal) Inicia Polling /api/appraisal/status];
    K --> L{API Route /api/appraisal/status};
    L --> M{Consulta DB (Supabase) por ID};
    M -->|Status = 'completed'| N[API /status Responde con Datos];
    M -->|Status = 'pending'| K; %% Continue Polling
    N --> O[Frontend Recibe Datos Completos];
    O --> P[Frontend Redirige a /appraisal/results?id=REQUEST_ID];
    P --> Q[Browser en /appraisal/results];
    Q --> R[Lee ID de URL Params];
    R --> S[Frontend Llama a /api/appraisal/status con ID];
    S --> M; %% Consulta DB nuevamente
    M -->|Datos Encontrados| T[Frontend Recibe Datos];
    T --> U[Muestra Datos Formateados en Página];