import { mount } from 'cypress/react';
import { SetupWorker, setupWorker } from 'msw/browser';
import { RequestHandler } from 'react-router-dom';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      interceptRequest(...handlers: RequestHandler[]): void;
    }
  }
}

Cypress.Commands.add('mount', mount)
Cypress.Commands.overwrite('log', (_subject, message) => cy.task('log', message));

/*
let worker: SetupWorker;

before(() => {
  worker = setupWorker();
  cy.wrap(worker.start({ onUnhandledRequest: 'bypass' }), { log: false });
});

Cypress.on('test:before:run', () => {
  if (!worker) return;
  worker.resetHandlers();
});

Cypress.Commands.add('interceptRequest', (...handlers: RequestHandler[]) => {
  if (!worker) return;
  worker.use(...handlers);
});
*/
