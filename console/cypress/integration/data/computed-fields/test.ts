import {
    openRawSQL,
    createTableAuthor,
    createCustomFunction,
    backToIndexRoute,
    insertAuthorsIntoTable,
    searchForTable
  } from './spec';
  import { testMode } from '../../../helpers/common';
  import { setMetaData } from '../../validators/validators';
  
  const setup = () => {
    describe('Setup route', () => {
      it('Visit the index route', () => {
        cy.visit('/data/schema/public');
        cy.wait(7000);
        setMetaData();
      });
    });
  };
  
  // TODO: add computed field with session arguments once that is added
  // TODO: write tests for Table Computed fields as well. Currently only added for scalar computed fields
  export const runComputedFieldTests = () => {
    describe('Computed Fields', () => {
      it('Open Raw SQL page', openRawSQL);
      it('Create test table', createTableAuthor);
      it('Run SQL for custom function', createCustomFunction);
      it('Insert entries into table', insertAuthorsIntoTable);
      it('Go back to index route', backToIndexRoute);
      it('Search for table', searchForTable);
      //   The rest of the TODOs
      //   it('Open Modify page of author table', funcName);
      //   it('Add computed field', funcName);
      //   it('Switch to GraphiQL page', funcName);
      //   it('Check computed field results on GraphiQL', funcName);
    });
  };
  
  if (testMode !== 'cli') {
    setup();
    runComputedFieldTests();
  }
  