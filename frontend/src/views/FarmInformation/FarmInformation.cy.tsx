import { BrowserRouter } from 'react-router-dom';
import FarmInformation from './FarmInformation';
import AppProvider from '@/context/AppProvider';

describe('FarmInformation tests', () => {
  it('Blah', () => {
    cy.mount(<AppProvider><BrowserRouter><FarmInformation /></BrowserRouter></AppProvider>);
    cy.get('#farmName').should('be.visible');
  });
});
