import memoize from 'moize';

import { ActionName, LoadingState } from './constants.const';
import { getAPIAction, getAction, DataAction } from './actions';
import { getAPIReducer, getSimpleReducer, getReducerKey, getReducerState } from './reducers';
import getResource, { Resource } from './getResource';
import { getFormattedActionName } from './utils';

type APIAction = (data: any, values?: any, headers?: any) => Function;

type SimpleAction = (data: any) => DataAction;

type ResourcesDictionary = { [key: string]: Resource };

type ReducersDictionary = { [key: string]: Function };

type CombinedAction = (actionName: string, body: any, values?: any, headers?: any) => any;

export interface CollectionOptions {
  [key: string]: any;
}

export interface APIResourceCollection {
  addResource: (resource: Resource) => void;
  getReducers: () => ReducersDictionary;
  action: CombinedAction;
  setSelectedItem: SimpleAction;
  deleteItem: APIAction;
  updateItem: APIAction;
  modifyItem: APIAction;
  createItem: APIAction;
  getItems: APIAction;
  getItem: APIAction;
  useCollection: (state: any) => any;
  addCreatedItem: SimpleAction;
  setUpdatedItem: SimpleAction;
  removeDeletedItem: SimpleAction;
}

const apiResourceCollection: (name: string, options?: CollectionOptions) => APIResourceCollection = (
  name,
  options = {}
) => {
  const resourceName: string = name.toUpperCase();

  const resources: ResourcesDictionary = {};

  const reducers: ReducersDictionary = {};

  const addResource: (resource: Resource) => void = resource => {
    resources[resource.actionName] = resource;
    const key: string = getReducerKey(resourceName, resource.actionName);
    const reducerFn: Function = resource.isAPIResource ? getAPIReducer : getSimpleReducer;
    reducers[key] = reducerFn(resourceName, resource);
  };

  const getReducers: () => ReducersDictionary = () => {
    return reducers;
  };

  const action: CombinedAction = (actionName, body, values = undefined, headers = undefined) => {
    actionName = getFormattedActionName(actionName);
    const resource: Resource = resources[actionName];
    return resource.isAPIResource ? apiAction(actionName, body, values, headers) : simpleAction(actionName, body);
  };

  const simpleAction: (actionName: string, body: any) => DataAction = (actionName, body) => {
    actionName = getFormattedActionName(actionName);
    const reducerState: string = getReducerState(actionName, resourceName);
    return getAction(reducerState, body);
  };

  const apiAction: (actionName: string, body: any, values: any, headers: any) => Function = (
    actionName,
    body,
    values = {},
    headers = {}
  ) => {
    actionName = getFormattedActionName(actionName);
    const resource: Resource = resources[actionName];
    headers = Object.assign({}, resource.headers, headers);
    return getAPIAction(resourceName, options, resource, body, values, headers);
  };

  const useCollection: (state: any) => any = state => {
    return getCollection(state, resources, resourceName);
  };

  // COMMON ACTIONS WRAPPERS:

  const setSelectedItem: SimpleAction = data => {
    return simpleAction(ActionName.SET_SELECTED_ITEM, data);
  };

  const addCreatedItem: SimpleAction = data => {
    return simpleAction(ActionName.ADD_CREATED_ITEM, data);
  };

  const setUpdatedItem: SimpleAction = data => {
    return simpleAction(ActionName.SET_UPDATED_ITEM, data);
  };

  const removeDeletedItem: SimpleAction = data => {
    return simpleAction(ActionName.REMOVE_DELETED_ITEM, data);
  };

  const deleteItem: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.DELETE_ITEM, data, values, headers);
  };

  const updateItem: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.UPDATE_ITEM, data, values, headers);
  };

  const modifyItem: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.MODIFY_ITEM, data, values, headers);
  };

  const createItem: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.CREATE_ITEM, data, values, headers);
  };

  const getItems: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.GET_ITEMS, data, values, headers);
  };

  const getItem: APIAction = (data, values, headers = {}) => {
    return apiAction(ActionName.GET_ITEM, data, values, headers);
  };

  // add setSelectedItem to resource collection:
  addResource(getResource(ActionName.SET_SELECTED_ITEM));

  return {
    addResource: addResource,
    getReducers: getReducers,
    action: action,
    setSelectedItem: setSelectedItem,
    deleteItem: deleteItem,
    updateItem: updateItem,
    modifyItem: modifyItem,
    createItem: createItem,
    getItems: getItems,
    getItem: getItem,
    useCollection: useCollection,
    addCreatedItem: addCreatedItem,
    setUpdatedItem: setUpdatedItem,
    removeDeletedItem: removeDeletedItem
  };
};

// HELPERS:

export type Collection = {
  isLoading: boolean;
  [key: string]: any;
};

export const getCollection: (state: any, resources: ResourcesDictionary, resourceName: string) => Collection = memoize(
  (state, resources, resourceName) => {
    let collection: Collection = { isLoading: false };
    Object.values(resources).forEach(resource => {
      const key: string = getReducerKey(resourceName, resource.actionName);
      collection[resource.dataName] = getCollectionState(state[key], resource.transforms[1]);
      collection.isLoading = state[key].isLoading ? true : collection.isLoading;
    });
    return collection;
  }
);

export const getLoadingState: (isLoading: boolean, isLoaded: boolean, isError: boolean) => string = memoize(
  (isLoading, isLoaded, isError) => {
    const loadingStr: string = `${Number(Boolean(isLoading))}.${Number(Boolean(isLoaded))}.${Number(Boolean(isError))}`;
    switch (loadingStr) {
      case '1.0.0':
        return LoadingState.LOADING;
      case '0.1.0':
        return LoadingState.LOADED;
      case '0.0.1':
        return LoadingState.ERROR;
      case '0.0.0':
      default:
        return LoadingState.INITIAL;
    }
  }
);

export const getCollectionState = memoize((state, transformFn) => {
  return {
    ...state,
    data: transformFn(state.data),
    loadingState: getLoadingState(state.isLoading, state.isLoaded, state.isError)
  };
});

export default apiResourceCollection;
