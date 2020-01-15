import memoize from 'moize';

import { ActionName, ResourceType, RequestStatus } from './constants.const';
import { DataAction } from './getAction';
import { ObjectWithID, DataTransform } from './dataTransforms';
import { Resource } from './getResource';
import { getFormattedActionName } from './utils';

export const getSimpleReducer: (resourceName: string, resource: Resource, defaultState: any) => Function = memoize(
  (resourceName: string, resource: Resource, defaultState: any = defaultSimpleReducerState) => {
    const reducer: (state: any, action: DataAction) => any = (state = defaultState, action: DataAction) => {
      const reducerState: string = getReducerState(resource.actionName, resourceName);
      switch (action.type) {
        case reducerState:
          return {
            ...state,
            data: {
              ...action.data
            },
            isSet: true
          };
        default:
          return state;
      }
    };
    return reducer;
  }
);

export const getAPIReducer: (resourceName: string, resource: Resource, defaultState: any) => Function = memoize(
  (resourceName, resource, defaultState = defaultAPIReducerState) => {
    return resource.type === ResourceType.MULTIPLE_ITEMS
      ? getCombinedReducer(resourceName, resource, defaultState)
      : getAPIRequestStatesReducer(resourceName, resource, defaultState);
  }
);

export const getAPIRequestStatesReducer: (resourceName: string, resource: Resource, defaultState: any) => Function = (
  resourceName,
  resource,
  defaultState
) => {
  const reducer: (state: any, action: DataAction) => any = (state = defaultState, action) => {
    const transformFn: DataTransform = resource.transforms[0];
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.REQUEST);
    const failure: string = getReducerState(resource.actionName, resourceName, RequestStatus.FAILURE);
    const success: string = getReducerState(resource.actionName, resourceName, RequestStatus.SUCCESS);
    switch (action.type) {
      case request:
        return {
          ...state,
          isLoading: true,
          isLoaded: false,
          isError: false,
          error: undefined
        };
      case success:
        return {
          ...state,
          isLoading: false,
          isLoaded: true,
          data: transformFn(action.data),
          isError: false,
          error: undefined
        };
      case failure:
        return {
          ...state,
          isLoaded: false,
          isLoading: false,
          isError: true,
          error: action.data
        };
      default:
        return state;
    }
  };
  return reducer;
};

export const getItemListReducer: (resourceName: string, resource: Resource, defaultState: any) => Function = (
  resourceName,
  resource,
  defaultState
) => {
  const reducer: (state: any, action: DataAction) => any = (state = defaultState, action) => {
    const created = getReducerState(ActionName.ADD_CREATED_ITEM, resourceName);
    const updated = getReducerState(ActionName.SET_UPDATED_ITEM, resourceName);
    const deleted = getReducerState(ActionName.REMOVE_DELETED_ITEM, resourceName);
    switch (action.type) {
      case created:
        return {
          ...state,
          data: addCreatedItem(action.data, state.data)
        };
      case updated:
        return {
          ...state,
          data: setUpdatedItem(action.data, state.data)
        };
      case deleted:
        return {
          ...state,
          data: removeDeletedItem(action.data, state.data)
        };
      default:
        return state;
    }
  };
  return reducer;
};

export const getCombinedReducer: (resourceName: string, resource: Resource, defaultState: any) => Function = (
  resourceName,
  resource,
  defaultState
) => {
  const itemListReducer = getItemListReducer(resourceName, resource, defaultState);
  const apiRequestStatesReducer = getAPIRequestStatesReducer(resourceName, resource, defaultState);
  const combinedReducer: (state: any, action: DataAction) => any = (state = defaultState, action) => {
    let newState: any = apiRequestStatesReducer(state, action);
    newState = itemListReducer(newState, action);
    return newState;
  };
  return combinedReducer;
};

export const getReducerKey: (resourceName: string, actionName: string) => string = memoize(
  (resourceName, actionName) => {
    return `${resourceName.toUpperCase()}.${actionName}`;
  }
);

export const getReducerState: (
  actionName: string,
  resourceName: string,
  state?: string | undefined
) => string = memoize((actionName, resourceName, state = undefined) => {
  const formattedActionName = getFormattedActionName(actionName);
  let reducerState: string = `${resourceName.toUpperCase()}_${formattedActionName}`;
  reducerState += state !== undefined ? `_${state}` : '';
  return reducerState;
});

export interface APIReducerState {
  data: any;
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  error: string | undefined;
}

export const defaultAPIReducerState: APIReducerState = {
  data: {},
  isLoading: false,
  isLoaded: false,
  isError: false,
  error: undefined
};

export const defaultSimpleReducerState = {
  isSet: false,
  data: {}
};

// HELPER FNS:

export type ObjectOperation = (item: ObjectWithID, dataObject: any) => any;

export const addItemToObject: ObjectOperation = (item, dataObject) => {
  const key = String(item.id);
  return {
    ...dataObject,
    [key]: item
  };
};

export const removeItemFromObject: ObjectOperation = (item, dataObject) => {
  const key = String(item.id);
  const obj = {
    ...dataObject
  };
  delete obj[key];
  return obj;
};

export const addCreatedItem: ObjectOperation = addItemToObject;

export const setUpdatedItem: ObjectOperation = addItemToObject;

export const removeDeletedItem: ObjectOperation = removeItemFromObject;
