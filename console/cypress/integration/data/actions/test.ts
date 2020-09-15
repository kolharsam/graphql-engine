import {
  createMutationAction,
  modifyMutationAction,
  routeToIndex,
  createQueryAction,
  modifyQueryAction,
  verifyMutation,
  verifyQuery,
  deleteMutationAction,
  deleteQueryAction,
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
    it('Verify Mutation Actions on GraphiQL', verifyMutation);
    it('Modify Mutation Action', modifyMutationAction);
    it('Delete Mutation Action', deleteMutationAction);
    it('Route to index', routeToIndex);
    it('Create an Query Action', createQueryAction);
    it('Verify Query Actions on GraphiQL', verifyQuery);
    it('Modify Query Action', modifyQueryAction);
    it('Delete Query Action', deleteQueryAction);
  });
};

if (testMode !== 'cli') {
  setup();
  runActionsTests();
}
