import { baseUrl, getElementFromAlias, getElementFromClassName } from '../../helpers/dataHelpers';
import { setPromptValue } from '../../helpers/common';

const statements = {
  createMutationActionText: `type Mutation {
    login (username: String!, password: String!): LoginResponse
  }`,
  createMutationCustomType: `type LoginResponse {
    accessToken: String!
  }
  `,
  createMutationHandler: 'https://hasura-actions-demo.glitch.me/login',
  createMutationGQLQuery: `mutation {
    login (username: "jondoe", password: "mysecretpassword") {
      accessToken
    `,
  createQueryActionText: `type Query {
    addNumbers (numbers: [Int]): AddResult
  }`,
  createQueryActionCustomType: `type AddResult {
    sum: Int
  }`,
  createQueryHandler: 'https://hasura-actions-demo.glitch.me/addNumbers',
  createQueryGQLQuery: `query {
    addNumbers(numbers: [1, 2, 3, 4]) {
      sum
    `,
  changeHandlerText: 'http://host.docker.internal:3000',
};

const clearActionDef = () => {
  cy.get('textarea').first().type('{selectall}', { force: true });
  cy.get('textarea').first().trigger('keydown', {
    keyCode: 46,
    which: 46,
    force: true,
  });
  cy.wait(2000);
};

const clearActionTypes = () => {
  cy.get('textarea').eq(1).type('{selectall}', { force: true });
  cy.get('textarea').eq(1).trigger('keydown', {
    keyCode: 46,
    which: 46,
    force: true,
  });
  cy.wait(2000);
};

const typeIntoActionDef = (content: string) => {
  cy.get('textarea').first().type(content, { force: true });
  cy.wait(2000);
};

const typeIntoActionTypes = (content: string) => {
  cy.get('textarea').eq(1).type(content, { force: true });
  cy.wait(2000);
};

const clearHandler = () => {
  cy.get(getElementFromAlias('action-create-handler-input')).type(
    '{selectall}',
    { force: true }
  );
  cy.get(getElementFromAlias('action-create-handler-input')).trigger(
    'keydown',
    {
      keyCode: 46,
      which: 46,
      force: true,
    }
  );
  cy.wait(2000);
};

const typeIntoHandler = (content: string) => {
  cy.get(getElementFromAlias('action-create-handler-input')).type(content, {
    force: true,
  });
  cy.wait(2000);
};

const clickOnCreateAction = () => {
  cy.get(getElementFromAlias('create-action-btn')).click();
  cy.wait(5000);
};

export const routeToGraphiql = () => {
  cy.visit('/api-explorer');
  cy.wait(7000);
  cy.url().should('eq', `${baseUrl}/api-explorer`);
};

export const createMutationAction = () => {
  // Click on create
  cy.get(getElementFromAlias('data-create-actions')).click();
  cy.wait(7000);
  // Clear default text on
  clearActionDef();
  // type statement
  typeIntoActionDef(statements.createMutationActionText);
  // clear defaults on action types
  clearActionTypes();
  // type the action type text
  typeIntoActionTypes(statements.createMutationCustomType);
  // clear handler
  clearHandler();
  // type into handler
  typeIntoHandler(statements.createMutationHandler);
  // click to create action
  clickOnCreateAction();
};

export const verifyMutation = () => {
  // NOTE/FIXME: This isn't working for some reason :P Need to check.
  routeToGraphiql();
  // Type the query
  cy.wait(5000);
  cy.get('textarea')
    .first()
    .type(`{enter}{uparrow}${statements.createMutationGQLQuery}`, {
      force: true,
    });
  cy.wait(5000);
  cy.get(getElementFromClassName('execute-button')).click();
  // FIXME: NOT GOOD!
  cy.wait(30000);
  cy.get('.cm-property').contains('login');
  cy.get('.cm-property').contains('accessToken');
  cy.get('.cm-string').contains('Ew8jkGCNDGAo7p35RV72e0Lk3RGJoJKB');

  cy.wait(2000);
};

export const modifyMutationAction = () => {
  cy.visit('/actions/manage/login/modify');
  cy.wait(7000);
  cy.url().should('eq', `${baseUrl}/actions/manage/login/modify`);

  clearHandler();
  typeIntoHandler(statements.changeHandlerText);

  cy.get(getElementFromAlias('save-modify-action-changes')).click();
  cy.wait(5000);

  // TODO?: Relationships & codegen part?

  // permissions part
  cy.get(getElementFromAlias('actions-permissions')).click();
  cy.wait(2000);

  cy.get(getElementFromAlias('role-textbox')).type('hakuna_matata');
  cy.wait(1000);

  cy.get(getElementFromAlias('hakuna_matata-Permission')).click();
  cy.wait(1000);
  cy.get(getElementFromAlias('save-permissions-for-action')).click();

  cy.get(getElementFromAlias('actions-modify')).click();

  cy.wait(3000);
};

const deleteAction = (promptValue: string) => {
  setPromptValue(promptValue);
  cy.get(getElementFromAlias('delete-action')).click();
  cy.window().its('prompt').should('be.called');
  cy.wait(7000);
};

export const deleteMutationAction = () => deleteAction('login');

export const routeToIndex = () => {
  cy.visit('/actions/manage/actions');
  cy.wait(7000);
  cy.url().should('eq', `${baseUrl}/actions/manage/actions`);
};

export const createQueryAction = () => {
  // Click on create
  cy.get(getElementFromAlias('data-create-actions')).click();
  cy.wait(7000);
  // Clear default text on
  clearActionDef();
  // type statement
  typeIntoActionDef(statements.createQueryActionText);
  // clear defaults on action types
  clearActionTypes();
  // type the action type text
  typeIntoActionTypes(statements.createQueryActionCustomType);
  // clear handler
  clearHandler();
  // type into handler
  typeIntoHandler(statements.createQueryHandler);
  // click to create action
  clickOnCreateAction();
};

export const verifyQuery = () => {
  // NOTE/FIXME: This isn't working for some reason :P Need to check.
  routeToGraphiql();
  cy.get('textarea')
    .first()
    .type(`{enter}{uparrow}${statements.createQueryGQLQuery}`, { force: true });
  cy.wait(5000);
  cy.get(getElementFromClassName('execute-button')).click();
  cy.wait(30000);
  cy.get('.cm-property').contains('addNumbers');
  cy.get('.cm-property').contains('sum');
  cy.get('.cm-number').contains('10');

  cy.wait(2000);
};

export const modifyQueryAction = () => {
  cy.visit('/actions/manage/addNumbers/modify');
  cy.wait(7000);
  cy.url().should('eq', `${baseUrl}/actions/manage/addNumbers/modify`);

  clearHandler();
  typeIntoHandler(statements.changeHandlerText);

  cy.get(getElementFromAlias('save-modify-action-changes')).click();
  cy.wait(5000);

  // TODO?: Relationships & codegen part?

  // permissions part
  cy.get(getElementFromAlias('actions-permissions')).click();
  cy.wait(2000);

  cy.get(getElementFromAlias('role-textbox')).type('MANAGER');
  cy.wait(1000);

  cy.get(getElementFromAlias('MANAGER-Permission')).click();
  cy.wait(1000);
  cy.get(getElementFromAlias('save-permissions-for-action')).click();

  cy.get(getElementFromAlias('actions-modify')).click();

  cy.wait(3000);
};

export const deleteQueryAction = () => deleteAction('addNumbers');
