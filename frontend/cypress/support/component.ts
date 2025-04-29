import { mount } from 'cypress/react'

Cypress.Commands.add('mount', mount)
Cypress.Commands.overwrite('log', (_subject, message) => cy.task('log', message));
