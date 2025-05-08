import { BrowserRouter } from 'react-router-dom';
import FarmInformation from '../../src/views/FarmInformation/FarmInformation';
import AppProvider from '@/context/AppProvider';

describe('FarmInformation tests', () => {
  before(() => {
    cy.intercept('GET', 'http://localhost:5173/__cypress/iframes/undefined/api/animals/', { statusCode: 200, body: { id: 1, name: 'Beef Cattle' } }).as('getAnimals');
    cy.intercept('GET', 'http://localhost:5173/__cypress/iframes/undefined/api/regions/', { statusCode: 200, body: { id: 1, name: 'Bulkley-Nechako' } }).as('getRegions');
    cy.intercept('GET', 'http://localhost:5173/__cypress/iframes/undefined/api/subregions/**', {statusCode: 200, body: { id: 1, name: 'Fort St. James' } }).as('getSubregions');
  });

  it('Farm Name allows any input', () => {
    cy.mount(<AppProvider><BrowserRouter><FarmInformation /></BrowserRouter></AppProvider>);
    cy.get('#farmName').type('1234567890').should('have.value', '1234567890');
    cy.get('#--error').should('not.exist');
    cy.get('#farmName').clear();
    cy.get('#farmName').type('qwertyuiop[]asdfghjkl;zxcvbnm,.').should('have.value', 'qwertyuiop[]asdfghjkl;zxcvbnm,.');
    cy.get('#--error').should('not.exist');
  });

  it('Year selection works', () => {
    cy.mount(<AppProvider><BrowserRouter><FarmInformation /></BrowserRouter></AppProvider>);
    cy.get('#year').click();
    cy.get('span').contains('2023').click();
    cy.get('#--error').should('not.exist');
    cy.get('#year').should('have.text', '2023');
  });

  it('Crops initializes to false and changes upon click', () => {
    cy.mount(<AppProvider><BrowserRouter><FarmInformation /></BrowserRouter></AppProvider>);
    cy.get('#hasHorticulturalCrops label[data-selected=true]').should('have.text', 'No');
    cy.get('#hasHorticulturalCrops label').contains('Yes').click();
    cy.get('#hasHorticulturalCrops label[data-selected=true]').should('have.text', 'Yes');
    // Click the same item again and expect nothing to change
    cy.get('#hasHorticulturalCrops label').contains('Yes').click();
    cy.get('#hasHorticulturalCrops label[data-selected=true]').should('have.text', 'Yes');
  });

  // Cannot test region, subregion, or livestock because network calls are failing
});
