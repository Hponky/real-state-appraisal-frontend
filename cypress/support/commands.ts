/// <reference types="cypress" />

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth');
  cy.get('h1').should('contain', 'Iniciar Sesión').and('be.visible');
  cy.get('input[id="email"]').should('be.visible').type(email);
  cy.get('input[id="password"]').should('be.visible').type(password);
  cy.get('button[type="submit"]').should('be.visible').click();
  cy.url().should('include', '/');
});