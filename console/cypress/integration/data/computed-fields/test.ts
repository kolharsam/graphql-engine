import {
    openRawSQL,
    createTableAuthor,
    createCustomFunction,
    backToIndexRoute,
    insertAuthorsIntoTable,
    searchForTable,
    cleanUpSql,
    openModifySection,
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
  
  // TODO: add computed field with session arguments once that is merged on master
  // TODO: write tests for Table Computed fields as well. Currently only added for scalar computed fields
  export const runComputedFieldTests = () => {
    describe('Computed Fields', () => {
      it('Open Raw SQL page', openRawSQL);
      it('Create test table', createTableAuthor);
      it('Run SQL for custom function', createCustomFunction);
      it('Insert entries into table', insertAuthorsIntoTable);
      it('Go back to index route', backToIndexRoute);
      it('Search for table', searchForTable);
      it('Open Modify page and add computed field', openModifySection);
      //   The rest of the TODOs
      //   it('Switch to GraphiQL page', funcName);
      //   it('Check computed field results on GraphiQL', funcName);
      it('Go back to index route', backToIndexRoute);
      it('Open Raw SQL page', openRawSQL);
      it('Test cleanup', cleanUpSql);
    });
  };
  
  if (testMode !== 'cli') {
    setup();
    runComputedFieldTests();
  }
  