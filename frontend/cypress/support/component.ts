import { mount } from 'cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
