import {
  getReducerKey,
  getReducerState,
  APIReducerState,
  defaultAPIReducerState,
  defaultSimpleReducerState,
  ObjectOperation,
  addItemToObject,
  removeDeletedItem,
  getSimpleReducer,
  getAPIRequestStatesReducer,
  getItemListReducer,
  getCombinedReducer,
  getAPIReducer
} from './reducers';
import getResource from './getResource';
import { ActionName } from './constants.const';
import { getAction, RequestStatus } from './actions';
import { getFormattedActionName } from './utils';

describe('getReducerKey', () => {
  test('uppercases resourceName & concatenates actionName', () => {
    expect(getReducerKey('users', 'GET_ITEMS')).toEqual('USERS.GET_ITEMS');
  });
});

describe('getReducerState', () => {
  test('no state to add', () => {
    expect(getReducerState('setItem', 'users')).toEqual('USERS_SET_ITEM');
  });
  test('add state', () => {
    expect(getReducerState('registerItem', 'users', 'REQUEST')).toEqual('USERS_REGISTER_ITEM_REQUEST');
  });
});

describe('addItemToObject', () => {
  test('add item into dictionary object', () => {
    const item = { id: 3, label: 'item 3' };
    const dataObject = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' }
    };
    const expected = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' },
      '3': { id: 3, label: 'item 3' }
    };
    expect(addItemToObject(item, dataObject)).toEqual(expected);
  });
});

describe('setUpdatedItem', () => {
  test('update item in dictionary object', () => {
    const item = { id: 3, label: 'item 3 new value' };
    const dataObject = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' },
      '3': { id: 3, label: 'item 3' }
    };
    const expected = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' },
      '3': { id: 3, label: 'item 3 new value' }
    };
    expect(addItemToObject(item, dataObject)).toEqual(expected);
  });
});

describe('removeDeletedItem', () => {
  test('remove item from dictionary object', () => {
    const item = { id: 3, label: 'item 3' };
    const dataObject = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' },
      '3': { id: 3, label: 'item 3' }
    };
    const expected = {
      '1': { id: 1, label: 'item 1' },
      '2': { id: 2, label: 'item 2' }
    };
    expect(removeDeletedItem(item, dataObject)).toEqual(expected);
  });
});

describe('getSimpleReducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.SET_SELECTED_ITEM);
  const simpleReducer = getSimpleReducer(resourceName, resource, defaultSimpleReducerState);
  const data = { id: 45, name: 'user name' };

  const reducerState: string = getReducerState(ActionName.SET_SELECTED_ITEM, resourceName);

  test('sets data correctly', () => {
    const action = getAction(reducerState, data);
    const newState = simpleReducer(defaultSimpleReducerState, action);
    const expected = {
      isSet: true,
      data
    };
    expect(newState).toEqual(expected);
  });

  test('does not set data', () => {
    const action = getAction('ACTION_NAME', data);
    const newState = simpleReducer(defaultSimpleReducerState, action);
    expect(newState).toEqual(defaultSimpleReducerState);
  });
});

describe('getAPIRequestStatesReducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.CREATE_ITEM, '/some/url/users');
  const reducer = getAPIRequestStatesReducer(resourceName, resource, defaultAPIReducerState);

  test('unrelated state - unchanged', () => {
    const request: string = getReducerState(resource.actionName, resourceName, 'UNRELATED_REQUEST');
    const action = getAction(request);
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(defaultAPIReducerState);
  });

  test('request state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.REQUEST);
    const action = getAction(request);
    const error: string | undefined = undefined;
    const expected = {
      data: {},
      isLoading: true,
      isLoaded: false,
      isError: false,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });

  test('success state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.SUCCESS);
    const data = { id: 34, name: 'created item' };
    const action = getAction(request, data);
    const error: string | undefined = undefined;
    const expected = {
      data,
      isLoading: false,
      isLoaded: true,
      isError: false,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });

  test('failed state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.FAILURE);
    const error = 'There was an error...';
    const action = getAction(request, error);
    const expected = {
      data: {},
      isLoading: false,
      isLoaded: false,
      isError: true,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });
});

describe('getItemListReducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.GET_ITEMS, '/some/url/users');
  const reducer = getItemListReducer(resourceName, resource, defaultAPIReducerState);

  test('unrelated state - unchanged', () => {
    const request: string = getReducerState('UNRELATED_REQUEST', resourceName);
    const action = getAction(request);
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(defaultAPIReducerState);
  });

  test('add created item', () => {
    const request: string = getReducerState(ActionName.ADD_CREATED_ITEM, resourceName);
    const item = { id: 12, name: 'added item' };
    const action = getAction(request, item);
    const initialState = { ...defaultAPIReducerState };
    const newState = reducer(initialState, action);
    const expected = {
      ...initialState,
      data: {
        ...initialState.data,
        '12': item
      }
    };
    expect(newState).toEqual(expected);
  });

  test('set updated item', () => {
    const request: string = getReducerState(ActionName.SET_UPDATED_ITEM, resourceName);
    const item = { id: 12, name: 'item updated' };
    const action = getAction(request, item);

    const initialState = {
      ...defaultAPIReducerState,
      data: { '12': { id: 12, name: 'added item' } }
    };
    const newState = reducer(initialState, action);

    const expected = {
      ...initialState,
      data: {
        ...initialState.data,
        '12': item
      }
    };
    expect(newState).toEqual(expected);
  });

  test('remove deleted item', () => {
    const request: string = getReducerState(ActionName.REMOVE_DELETED_ITEM, resourceName);
    const item = { id: 12, name: 'added item' };
    const action = getAction(request, item);

    const initialState = {
      ...defaultAPIReducerState,
      data: { '12': { id: 12, name: 'added item' }, '13': { id: 13, name: 'item' } }
    };
    const newState = reducer(initialState, action);

    const expected = {
      ...initialState,
      data: { '13': { id: 13, name: 'item' } }
    };
    expect(newState).toEqual(expected);
  });
});

describe('getCombinedReducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.GET_ITEMS, '/some/url/users');
  const reducer = getCombinedReducer(resourceName, resource, defaultAPIReducerState);

  test('unrelated state - unchanged', () => {
    const request: string = getReducerState('UNRELATED_REQUEST', resourceName);
    const action = getAction(request);
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(defaultAPIReducerState);
  });

  test('success state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.SUCCESS);
    const data = { id: 34, name: 'created item' };
    const action = getAction(request, [data]);
    const error: string | undefined = undefined;
    const expected = {
      data: { '34': data },
      isLoading: false,
      isLoaded: true,
      isError: false,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });

  test('add created item works', () => {
    const request: string = getReducerState(ActionName.ADD_CREATED_ITEM, resourceName);
    const item = { id: 12, name: 'added item' };
    const action = getAction(request, item);
    const initialState = { ...defaultAPIReducerState };
    const newState = reducer(initialState, action);
    const expected = {
      ...initialState,
      data: {
        ...initialState.data,
        '12': item
      }
    };
    expect(newState).toEqual(expected);
  });
});

describe('getAPIReducer/combined reducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.GET_ITEMS, '/some/url/users');
  const reducer = getAPIReducer(resourceName, resource, defaultAPIReducerState);

  test('success state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.SUCCESS);
    const data = { id: 34, name: 'created item' };
    const action = getAction(request, [data]);
    const error: string | undefined = undefined;
    const expected = {
      data: { '34': data },
      isLoading: false,
      isLoaded: true,
      isError: false,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });

  test('add created item works', () => {
    const request: string = getReducerState(ActionName.ADD_CREATED_ITEM, resourceName);
    const item = { id: 12, name: 'added item' };
    const action = getAction(request, item);
    const initialState = { ...defaultAPIReducerState };
    const newState = reducer(initialState, action);
    const expected = {
      ...initialState,
      data: {
        ...initialState.data,
        '12': item
      }
    };
    expect(newState).toEqual(expected);
  });
});

describe('getAPIReducer/request states only reducer', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.MODIFY_ITEM, '/some/url/users');
  const reducer = getAPIReducer(resourceName, resource, defaultAPIReducerState);

  test('success state is set correctly', () => {
    const request: string = getReducerState(resource.actionName, resourceName, RequestStatus.SUCCESS);
    const data = { id: 34, name: 'modified item' };
    const action = getAction(request, data);
    const error: string | undefined = undefined;
    const expected = {
      data,
      isLoading: false,
      isLoaded: true,
      isError: false,
      error
    };
    const newState = reducer(defaultAPIReducerState, action);
    expect(newState).toEqual(expected);
  });

  test('add created item has no effect', () => {
    const request: string = getReducerState(ActionName.ADD_CREATED_ITEM, resourceName);
    const item = { id: 12, name: 'added item' };
    const action = getAction(request, item);
    const initialState = { ...defaultAPIReducerState };
    const newState = reducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});
