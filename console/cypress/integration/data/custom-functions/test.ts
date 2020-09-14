import {
    openRawSQL,
    createTableArticle,
    createCustomFunction,
    insertAuthorsIntoTable,
    cleanUpSql,
    trackCustomFn,
    routeToGraphiql,
    verifyCustomFnResult,
    routeToSQLPage,
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

  export const runCustomFunctionTests = () => {
    describe('Custom Functions', () => {
      it('Open Raw SQL page', openRawSQL);
      it('Create test table', createTableArticle);
      it('Run SQL for custom function', createCustomFunction);
      it('Insert articles into table', insertAuthorsIntoTable);
      it('Track table & custom function', trackCustomFn);
      it('Route to GraphiQL page', routeToGraphiql);
      it('Check custom function results on GraphiQL', verifyCustomFnResult);
      it('Route to Raw SQL page', routeToSQLPage);
      it('Test cleanup', cleanUpSql);
    });
  };

  if (testMode !== 'cli') {
    setup();
    runCustomFunctionTests();
  }
