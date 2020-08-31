import { MetadataActions } from './actions';
import { HasuraMetadataV2 } from './types';

// todo -- separate allowed queries

type MetadataState = {
  metadataObject: null | HasuraMetadataV2;
  error: null | string | boolean;
  loading: boolean;
  inconsistentObjects: any[];
  ongoingRequest: boolean; // deprecate
  allowedQueries: any[];
};

const defaultState: MetadataState = {
  metadataObject: null,
  error: null,
  loading: false,
  inconsistentObjects: [],
  ongoingRequest: false,
  allowedQueries: [],
};

export const metadataReducer = (
  state = defaultState,
  action: MetadataActions
): MetadataState => {
  switch (action.type) {
    case 'Metadata/EXPORT_METADATA_SUCCESS':
      return {
        ...state,
        metadataObject: action.data,
        loading: false,
        error: null,
      };
    case 'Metadata/EXPORT_METADATA_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'Metadata/EXPORT_METADATA_ERROR':
      return {
        ...state,
        loading: false,
        error: action.data,
      };

    case 'Metadata/LOAD_INCONSISTENT_OBJECTS_SUCCESS':
      return {
        ...state,
        inconsistentObjects: action.data,
        ongoingRequest: false,
      };
    case 'Metadata/LOAD_INCONSISTENT_OBJECTS_REQUEST':
      return {
        ...state,
        ongoingRequest: true,
      };
    case 'Metadata/LOAD_INCONSISTENT_OBJECTS_ERROR':
      return {
        ...state,
        error: true,
        ongoingRequest: false,
      };

    case 'Metadata/DROP_INCONSISTENT_METADATA_SUCCESS':
      return {
        ...state,
        inconsistentObjects: [],
        ongoingRequest: false,
      };
    case 'Metadata/DROP_INCONSISTENT_METADATA_REQUEST':
      return {
        ...state,
        ongoingRequest: true,
      };
    case 'Metadata/DROP_INCONSISTENT_METADATA_ERROR':
      return {
        ...state,
        ongoingRequest: false,
      };

    case 'Metadata/LOAD_ALLOWED_QUERIES':
      return {
        ...state,
        allowedQueries: action.data,
      };
    case 'Metadata/ADD_ALLOWED_QUERIES':
      return {
        ...state,
        allowedQueries: [...state.allowedQueries, ...action.data],
      };
    case 'Metadata/DELETE_ALLOW_LIST':
      return {
        ...state,
        allowedQueries: [],
      };
    case 'Metadata/DELETE_ALLOWED_QUERY':
      return {
        ...state,
        allowedQueries: [
          ...state.allowedQueries.filter(q => q.name !== action.data),
        ],
      };
    case 'Metadata/UPDATE_ALLOWED_QUERY':
      return {
        ...state,
        allowedQueries: [
          ...state.allowedQueries.map(q =>
            q.name === action.data.queryName ? action.data.newQuery : q
          ),
        ],
      };

    default:
      return state;
  }
};
