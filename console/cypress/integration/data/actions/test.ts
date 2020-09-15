import {
  createMutationAction,
  modifyMutationAction,
  routeToIndex,
  createQueryAction,
  modifyQueryAction,
  verifyMutation,
  verifyQuery,
} from './spec';
import { testMode } from '../../../helpers/common';
import { setMetaData } from '../../validators/validators';

const setup = () => {
  describe('Setup route', () => {
    it('Visit the index route', () => {
      cy.visit('/actions/manage/actions');
      cy.wait(7000);
      setMetaData();
    });
  });
};

export const runActionsTests = () => {
  describe('Actions', () => {
    it('Create an Mutation Action', createMutationAction);
    it('Verify Mutation Actions on graphiql', verifyMutation);
    it('Modify Mutation Action', modifyMutationAction);
    it('Route to index', routeToIndex);
    it('Create an Query Action', createQueryAction);
    it('Verify Query Actions on graphiql', verifyQuery);
    it('Modify Query Action', modifyQueryAction);
  });
};

if (testMode !== 'cli') {
  setup();
  runActionsTests();
}
