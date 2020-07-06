import GraphiQLExplorer from 'graphiql-explorer';
import { getLSItem, setLSItem } from '../../../../utils/localstorage';

export const makeDefaultArg = () => {
  return false;
};

export const getDefaultScalarArgValue = (parentField, arg, argType) => {
  return GraphiQLExplorer.defaultValue(argType);
};

export const getExplorerWidth = () => {
  const defaultWidth = 300;

  const widthLSRaw = getLSItem('graphiql:explorerWidth');
  const widthLS = parseInt(widthLSRaw, 10);

  return !isNaN(widthLS) ? widthLS : defaultWidth;
};

export const setExplorerWidth = width => {
  setLSItem('graphiql:explorerWidth', width);
};

export const getExplorerIsOpen = () => {
  const defaultIsOpen = true;

  const isOpen = getLSItem('graphiql:explorerOpen');

  return isOpen ? isOpen === 'true' : defaultIsOpen;
};

export const setExplorerIsOpen = isOpen => {
  setLSItem('graphiql:explorerOpen', isOpen);
};

export const persistCodeExporterOpen = isOpen => {
  setLSItem('graphiql:codeExporterOpen', JSON.stringify(isOpen));
};

export const getPersistedCodeExporterOpen = () => {
  const isOpen = getLSItem('graphiql:codeExporterOpen');

  if (!isOpen) return false;

  try {
    return JSON.parse(isOpen);
  } catch {
    return false;
  }
};
