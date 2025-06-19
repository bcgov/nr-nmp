import { BrowserRouter } from 'react-router-dom';
import FarmInformation from '../../src/views/FarmInformation/FarmInformation';
import { AppStateProvider } from '@/context/AppStateContext';

describe('FarmInformation tests', () => {
  /*
  before(() => {
    cy.intercept('GET', 'undefined/api/animals/', { statusCode: 200, body: { id: 1, name: 'Beef Cattle' } }).as('getAnimals');
    cy.intercept('GET', 'undefined/api/regions/', { statusCode: 200, body: { id: 1, name: 'Bulkley-Nechako' } }).as('getRegions');
    cy.intercept('GET', 'undefined/api/subregions/**', {statusCode: 200, body: { id: 1, name: 'Fort St. James' } }).as('getSubregions');
  });
  */

  it('Farm Name allows any input', () => {
    cy.mount(
      <AppStateProvider>
        <BrowserRouter>
          <FarmInformation />
        </BrowserRouter>
      </AppStateProvider>,
    );
    cy.get('#farmName');
    cy.get('#--error').should('not.exist');
  });
});
