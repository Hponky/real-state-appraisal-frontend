# Plan de Mejora del Flujo de Peritaje

Este plan detalla las mejoras propuestas para refinar los endpoints de la API y la página de resultados del peritaje, basándose en el análisis y los logs recientes.

## Puntos Clave a Mejorar:

1.  **Discrepancia en el Endpoint `/api/appraisal/receive`:** Los logs y la respuesta (404) no reflejan correctamente que la actualización en Supabase fue exitosa.
2.  **Advertencia de `cookies()` en `/api/appraisal/status`:** Eliminar la advertencia de Next.js sobre el uso síncrono de `cookies()`.
3.  **Mejora de la Visualización de Resultados en la Página de Resultados:** Presentar los datos del peritaje de n8n de manera estructurada y legible.

## Plan Detallado:

### 1. Refinar el Endpoint `/api/appraisal/receive`

*   **Objetivo:** Asegurar que este endpoint responda de manera consistente y precisa a n8n después de intentar actualizar la base de datos, y que los logs reflejen el resultado real.
*   **Pasos:**
    *   Revisar la lógica después de la operación `supabaseServiceRole.from('appraisals').update(...).eq('id', requestId).select().single()`.
    *   Asegurar que si `error` es nulo, la respuesta a n8n sea siempre 200 OK, indicando que la recepción y el intento de guardado fueron procesados por el backend, independientemente de si `data` contiene la fila actualizada (ya que el frontend usa Realtime).
    *   Ajustar los logs para diferenciar claramente entre un error de Supabase y el caso en que no se encontró una fila para actualizar (lo cual, si la inserción inicial fue exitosa, podría indicar un problema con el `requestId` o un retraso en la propagación de la escritura, aunque Realtime lo detectó). Podríamos considerar si la lógica de "no row found" debería ser un error 404 o manejarse de otra forma si la inserción inicial garantiza que la fila existe. Por ahora, nos centraremos en asegurar la respuesta 200 OK a n8n si no hay error de Supabase.
    *   Considerar si la cláusula `.select().single()` es realmente necesaria en este endpoint si el frontend no utiliza los datos devueltos aquí. Eliminarla podría simplificar la operación si solo se necesita confirmar la actualización.

### 2. Corregir la Advertencia de `cookies()` en `/api/appraisal/status`

*   **Objetivo:** Eliminar la advertencia de Next.js sobre el uso síncrono de `cookies()` en un Route Handler.
*   **Pasos:**
    *   Modificar la función `GET` en `app/api/appraisal/status/route.ts`.
    *   Asegurar que la llamada a `cookies()` se realice y se espere correctamente antes de usar el `cookieStore` para inicializar el cliente Supabase. La forma recomendada es `const cookieStore = cookies(); const supabase = createRouteHandlerClient({ cookies: () => cookieStore });`. Reconfirmaremos la implementación correcta y ajustaremos si es necesario.

### 3. Mejorar la Visualización de Resultados en la Página de Resultados

*   **Objetivo:** Presentar los datos del peritaje de n8n de manera estructurada y legible en lugar de mostrar el objeto JSON crudo.
*   **Pasos:**
    *   Analizar la estructura exacta del objeto `appraisalData.initial_data` que se recibe en `app/appraisal/results/page.tsx`.
    *   Modificar el componente para acceder a las propiedades relevantes dentro de `appraisalData.initial_data` (como `analisis_mercado`, `evaluacion_tecnica`, `valoracion_actual`, `potencial_valorizacion`).
    *   Renderizar estos datos utilizando componentes de UI (como los de `components/ui/`) para crear secciones claras para cada parte del peritaje (ej. Información General, Análisis de Mercado, Evaluación Técnica, Valoración, Potencial de Valorización).
    *   Formatear los valores numéricos (ej. precios) y las listas (ej. observaciones, recomendaciones) para una mejor lectura.

## Diagrama del Flujo con Puntos de Mejora:

```mermaid
graph TD
    A[Frontend Form Submit] --> B[useAppraisalSubmission];
    B --> C[Insert Pending in DB];
    C --> D[Call appraisalApiService];
    D --> E[Call n8n Webhook];
    E --> F[n8n Processing];
    F --> G[/api/appraisal/receive];
    G --> H[Update DB with Results];
    H -- Realtime Update --> I[useAppraisalSubmission Realtime Sub];
    I --> J[Redirect to /results];
    J --> K[/appraisal/results page];
    K --> L[/api/appraisal/status];
    L --> M[Query DB for Results];
    M --> K;

    subgraph Mejoras
        G -- Refinar Response/Logs --> G;
        L -- Fix cookies() warning --> L;
        K -- Improve Data Display --> K;
    end
```

Este plan proporciona una hoja de ruta para abordar las áreas identificadas para mejorar la robustez y la presentación de la aplicación.