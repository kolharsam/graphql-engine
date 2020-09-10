import { baseUrl, getElementFromAlias } from '../../../helpers/dataHelpers';

export const openRawSQL = () => {
  cy.get('a')
    .contains('Data')
    .click();
  cy.wait(3000);
  cy.get(getElementFromAlias('sql-link')).click();
  cy.wait(3000);
  cy.url().should('eq', `${baseUrl}/data/sql`);
};

const sqlStatements = {
  createTableSql: 'CREATE TABLE a_test_test_author (id serial PRIMARY KEY, first_name text, last_name text);',
  createCustomFuncSql: `CREATE OR REPLACE FUNCTION test_get_author_full_name(a_test_test_author_row a_test_test_author)
  RETURNS TEXT AS $function$
  SELECT a_test_test_author_row.first_name || ' ' || a_test_test_author_row.last_name
  $function$
  LANGUAGE sql STABLE;`,
  insertData_a1: `INSERT INTO a_test_test_author(first_name, last_name) VALUES ('jk', 'rowling');`,
  insertData_a2: `INSERT INTO a_test_test_author(first_name, last_name) VALUES ('enid', 'blyton');`,
  // TODO
  // deleteTable
  // deleteFunction
};

const clearText = () => {
  cy.get('textarea').type('{selectall}', { force: true });
  cy.get('textarea').trigger('keydown', {
    keyCode: 46,
    which: 46,
    force: true,
  });
  cy.wait(2000);
};

const typeSQL = (
  statement: string,
  shouldClearText = false,
  waitTimeUponType = 2000,
  endWaitTime = 5000,
) => {
  if (shouldClearText) {
    clearText();
  }
  cy.get('textarea').type(statement, { force: true });
  cy.wait(waitTimeUponType);
  cy.get(getElementFromAlias('run-sql')).click();
  // FIXME: maybe necessary for CLI mode
  // cy.get(getElementFromAlias('raw-sql-statement-timeout')).should('be.disabled');
  cy.wait(endWaitTime);
};

export const createTableAuthor = () => typeSQL(sqlStatements.createTableSql);

export const createCustomFunction = () => typeSQL(sqlStatements.createCustomFuncSql, true);

export const insertAuthorsIntoTable = () => {
  typeSQL(sqlStatements.insertData_a1, true);
  typeSQL(sqlStatements.insertData_a2, true);
  clearText();
};

export const backToIndexRoute = () => {
  cy.visit('/data/schema/public');
  cy.wait(7000);
};

export const searchForTable = () => {
  cy.get(getElementFromAlias('search-tables')).type('author');
  cy.get(getElementFromAlias('table-links')).should('contain', 'a_test_test_author');
};
