export enum ActionName {
  CREATE_ITEM = 'CREATE_RESOURCE_ITEM',
  UPDATE_ITEM = 'UPDATE_RESOURCE_ITEM',
  MODIFY_ITEM = 'MODIFY_RESOURCE_ITEM',
  DELETE_ITEM = 'DELETE_RESOURCE_ITEM',
  GET_ITEMS = 'GET_RESOURCE_ITEMS',
  GET_ITEM = 'GET_RESOURCE_ITEM',
  SET_SELECTED_ITEM = 'SET_SELECTED_ITEM',
  ADD_CREATED_ITEM = 'ADD_CREATED_ITEM',
  SET_UPDATED_ITEM = 'SET_UPDATED_ITEM',
  REMOVE_DELETED_ITEM = 'REMOVE_DELETED_ITEM',
  SET_ITEM_DATA = 'SET_ITEM_DATA',
  CLEAR = 'CLEAR'
}

export enum ResourceType {
  MULTIPLE_ITEMS = 'MULTIPLE_ITEMS',
  SINGLE_ITEM = 'SINGLE_ITEM'
}

export enum LoadingState {
  INITIAL = 'initial',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

export enum RequestStatus {
  REQUEST = 'REQUEST',
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}
