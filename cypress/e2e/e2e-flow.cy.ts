describe('End-to-End Flow Tests', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should allow a user to register successfully', () => {
    const uniqueEmail = `testuser-${Date.now()}@example.com`;
    const password = 'Password123!';

    // Navegar a la vista de registro
    cy.get('button.text-primary.hover:underline').contains('Regístrate').click();
    cy.get('h1').should('contain', 'Registro');

    // Rellenar el formulario de registro
    cy.get('input[id="fullName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="idNumber"]').type('1234567890');
    cy.get('input[id="email"]').type(uniqueEmail);
    cy.get('input[id="phone"]').type('3001234567');
    cy.get('input[id="password"]').type(password);

    // Enviar el formulario
    cy.get('button[type="submit"]').click();

    // Verificar que el registro fue exitoso (redirigido a login o mensaje de éxito)
    // Asume que después de un registro exitoso, se redirige a la página de login
    cy.get('h1').should('contain', 'Iniciar Sesión');
    cy.get('input[id="email"]').should('have.value', uniqueEmail); // Verifica que el email se precargue
  });

  it('should allow a registered user to log in successfully', () => {
    // Asume que ya existe un usuario registrado para esta prueba
    // Para un entorno de CI/CD, se debería sembrar un usuario de prueba antes de ejecutar esta prueba.
    const existingEmail = 'existinguser@example.com'; // Reemplazar con un email de prueba real
    const existingPassword = 'ExistingPassword123!'; // Reemplazar con una contraseña de prueba real

    // Rellenar el formulario de inicio de sesión
    cy.get('input[id="email"]').type(existingEmail);
    cy.get('input[id="password"]').type(existingPassword);

    // Enviar el formulario
    cy.get('button[type="submit"]').click();

    // Verificar que el inicio de sesión fue exitoso
    cy.url().should('include', '/'); // Asume redirección a la página principal
    // Verificar que el usuario está autenticado (ej. un elemento visible solo para usuarios logueados)
    // cy.get('[data-cy="user-dashboard-link"]').should('be.visible');
  });

  it('should allow a logged-in user to perform an appraisal and save the result', () => {
    const uniqueEmail = `appraisaluser-${Date.now()}@example.com`;
    const password = 'Password123!';

    // 1. Registrar un nuevo usuario
    cy.get('button.text-primary.hover:underline').contains('Regístrate').click();
    cy.get('input[id="fullName"]').type('Appraisal');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="idNumber"]').type('1000000000');
    cy.get('input[id="email"]').type(uniqueEmail);
    cy.get('input[id="phone"]').type('3009876543');
    cy.get('input[id="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/auth'); // Redirigido a login después del registro

    // 2. Iniciar sesión con el usuario recién registrado
    cy.get('input[id="email"]').type(uniqueEmail);
    cy.get('input[id="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/'); // Redirigido a la página principal

    // 3. Navegar a la página de peritaje
    cy.visit('/appraisal');
    cy.url().should('include', '/appraisal');
    cy.get('h1').should('contain', 'Formulario de Peritaje Inmobiliario');

    // 4. Rellenar el formulario de peritaje con datos de prueba
    cy.get('input[id="address"]').type('Calle Falsa 123');
    cy.get('input[id="city"]').type('Springfield');
    cy.get('select[id="propertyType"]').select('Casa');
    cy.get('input[id="constructionArea"]').type('150');
    cy.get('input[id="landArea"]').type('200');
    cy.get('input[id="bedrooms"]').type('3');
    cy.get('input[id="bathrooms"]').type('2');
    cy.get('input[id="parkingSpaces"]').type('1');
    cy.get('input[id="age"]').type('10');
    cy.get('select[id="materialQuality"]').select('Buena');
    cy.get('select[id="conservationStatus"]').select('Bueno');

    // 5. Enviar el formulario
    cy.get('button[type="submit"]').click();

    // 6. Verificar que el resultado del peritaje se muestre correctamente
    cy.url().should('include', '/appraisal/results');
    cy.get('h1').should('contain', 'Resultado del Peritaje');
    cy.get('p').should('contain', 'Valor de Mercado Estimado:');

    // 7. Guardar el resultado del peritaje
    cy.get('button').contains('Guardar Historial').click();

    // 8. Verificar que el resultado se guarde exitosamente
    cy.get('div[role="status"]').should('contain', 'Resultado guardado exitosamente'); // Asume un toast o mensaje de éxito
  });
it('should allow a logged-in user to view their appraisal history', () => {
    // Asume que el usuario ya ha guardado al menos un peritaje en la prueba anterior
    // o que existe un usuario con historial pre-sembrado.
    const existingEmail = 'appraisaluser@example.com'; // Usar el email del usuario de la prueba anterior o uno de prueba
    const existingPassword = 'Password123!';

    // Iniciar sesión
    cy.visit('/auth');
    cy.get('input[id="email"]').type(existingEmail);
    cy.get('input[id="password"]').type(existingPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');

    // Navegar a la página de historial
    cy.visit('/history');
    cy.url().should('include', '/history');
    cy.get('h1').should('contain', 'Historial de Peritajes');

    // Verificar que al menos un resultado de peritaje se muestre
    cy.get('[data-cy="appraisal-history-item"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="appraisal-history-item"]').first().should('contain', 'Valor de Mercado Estimado:');
  });
it('should allow a logged-in user to download a PDF appraisal report', () => {
    // Asume que el usuario ya ha guardado al menos un peritaje
    const existingEmail = 'appraisaluser@example.com'; // Usar el email del usuario de la prueba anterior o uno de prueba
    const existingPassword = 'Password123!';

    // Iniciar sesión
    cy.visit('/auth');
    cy.get('input[id="email"]').type(existingEmail);
    cy.get('input[id="password"]').type(existingPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');

    // Navegar a la página de historial para seleccionar un peritaje
    cy.visit('/history');
    cy.url().should('include', '/history');
    cy.get('h1').should('contain', 'Historial de Peritajes');

    // Click en el primer elemento del historial para ver los detalles y descargar el PDF
    cy.get('[data-cy="appraisal-history-item"]').first().click();
    cy.url().should('include', '/appraisal/results'); // Asume que redirige a la página de resultados con el ID

    // Interceptar la solicitud de descarga de PDF
    cy.intercept('GET', '/api/appraisal/pdf/**').as('downloadPdf');

    // Click en el botón de descarga de PDF
    cy.get('button').contains('Descargar PDF').click();

    // Esperar a que la solicitud de descarga se complete y verificar la respuesta
    cy.wait('@downloadPdf').its('response.statusCode').should('eq', 200);
    cy.wait('@downloadPdf').its('response.headers').should('include', {
      'content-type': 'application/pdf',
    });
  });
});