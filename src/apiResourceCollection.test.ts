import apiResourceCollection, { getCollection, getLoadingState, getCollectionState } from './apiResourceCollection';
import { ActionName, LoadingState } from './constants.const';
import { noTransform, arrObjectValues } from './dataTransforms';
import { defaultAPIReducerState } from './reducers';
import getResource from './getResource';

describe('getCollection', () => {
  const resourceName = 'users';
  const resource = getResource(ActionName.GET_ITEM, '/some/url');
  const error: string | undefined = undefined;
  const state = {
    'USERS.GET_RESOURCE_ITEM': {
      data: {},
      isLoading: false,
      isLoaded: false,
      isError: false,
      error
    }
  };
  const resources = {
    [ActionName.GET_ITEM]: resource
  };
  const collection = getCollection(state, resources, resourceName);

  const expected = {
    isLoading: false,
    item: {
      ...state['USERS.GET_RESOURCE_ITEM'],
      loadingState: LoadingState.INITIAL
    }
  };

  test('collection is returned in correct state', () => {
    expect(collection).toEqual(expected);
  });
});

describe('getLoadingState', () => {
  test('initial state', () => {
    expect(getLoadingState(false, false, false)).toEqual(LoadingState.INITIAL);
  });
  test('loading state', () => {
    expect(getLoadingState(true, false, false)).toEqual(LoadingState.LOADING);
  });
  test('loaded state', () => {
    expect(getLoadingState(false, true, false)).toEqual(LoadingState.LOADED);
  });
  test('error state', () => {
    expect(getLoadingState(false, false, true)).toEqual(LoadingState.ERROR);
  });
  test('default state', () => {
    expect(getLoadingState(true, true, true)).toEqual(LoadingState.INITIAL);
  });
});

describe('getCollectionState', () => {
  const data = { '1': { id: 1, name: 'item 1' }, '2': { id: 2, name: 'item 2' } };
  const transformFn = arrObjectValues;
  const initialState = {
    ...defaultAPIReducerState,
    isLoaded: true,
    data
  };
  const collectionState = getCollectionState(initialState, transformFn);

  test('state is set correctly', () => {
    expect(collectionState.isLoading).toEqual(false);
    expect(collectionState.isLoaded).toEqual(true);
    expect(collectionState.isError).toEqual(false);
    expect(collectionState.error).toBe(undefined);
  });
  test('data is transformed', () => {
    expect(collectionState.data).toEqual([
      { id: 1, name: 'item 1' },
      { id: 2, name: 'item 2' }
    ]);
  });
  test('loading state is set', () => {
    expect(collectionState.loadingState).toBe(LoadingState.LOADED);
  });
});

describe('apiResourceCollection', () => {
  const resourceName = 'users';
  const options = {
    token: 'token:4ti3itcqyq3y'
  };
  const collection = apiResourceCollection(resourceName, options);

  test('setSelectedItem gets added automatically', () => {
    const reducers = collection.getReducers();
    expect(reducers['USERS.SET_SELECTED_ITEM']).toBeDefined();
  });

  test('addResource()', () => {
    const resource = getResource(ActionName.GET_ITEMS, '/some/url');
    collection.addResource(resource);
    const reducers = collection.getReducers();
    expect(reducers['USERS.' + ActionName.GET_ITEMS]).toBeDefined();
  });

  test("action() will throw error if doesn't match resource", () => {
    const func = () => {
      const action = collection.action(ActionName.GET_ITEM, {}, {}, {});
    };
    expect(func).toThrowError();
  });

  test('action() will not throw error if resource matches', () => {
    const func = () => {
      const action = collection.action(ActionName.GET_ITEMS, {}, {}, {});
    };
    expect(func).not.toThrowError();
  });

  test('action() will return apiAction', async () => {
    const action = collection.action(ActionName.GET_ITEMS, {}, {}, {});
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    expect(dispatch).toHaveBeenCalled();
  });

  test('action() will return simpleAction', () => {
    const data = { id: 87 };
    const action = collection.action(ActionName.SET_SELECTED_ITEM, data);
    const expected = { type: 'USERS_SET_SELECTED_ITEM', data: data };
    expect(action).toEqual(expected);
  });

  test('deleteItem() will return correct action', async () => {
    const resource = getResource(ActionName.DELETE_ITEM, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.deleteItem(data, {});
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_DELETE_RESOURCE_ITEM_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('updateItem() will return correct action', async () => {
    const resource = getResource(ActionName.UPDATE_ITEM, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.updateItem(data, {});
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_UPDATE_RESOURCE_ITEM_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('modifyItem() will return correct action', async () => {
    const resource = getResource(ActionName.MODIFY_ITEM, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.modifyItem(data, {});
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_MODIFY_RESOURCE_ITEM_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('createItem() will return correct action', async () => {
    const resource = getResource(ActionName.CREATE_ITEM, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.createItem(data, {});
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_CREATE_RESOURCE_ITEM_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('getItems() will return correct action', async () => {
    const resource = getResource(ActionName.GET_ITEMS, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.getItems(data);
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_GET_RESOURCE_ITEMS_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('getItem() will return correct action', async () => {
    const resource = getResource(ActionName.GET_ITEM, '/some/url');
    collection.addResource(resource);
    const data = { id: 87 };
    const action = collection.getItem(data);
    const dispatch = jest.fn(action => action);
    const response = await action(dispatch);
    const expected = { type: 'USERS_GET_RESOURCE_ITEM_REQUEST' };
    expect(dispatch.mock.calls[0][0]).toEqual(expected);
  });

  test('setSelectedItem() will return correct action', () => {
    const data = { id: 87 };
    const action = collection.setSelectedItem(data);
    const expected = { type: 'USERS_SET_SELECTED_ITEM', data: data };
    expect(action).toEqual(expected);
  });

  test('addCreatedItem() will return correct action', () => {
    const data = { id: 87 };
    const action = collection.addCreatedItem(data);
    const expected = { type: 'USERS_ADD_CREATED_ITEM', data: data };
    expect(action).toEqual(expected);
  });

  test('setUpdatedItem() will return correct action', () => {
    const data = { id: 87 };
    const action = collection.setUpdatedItem(data);
    const expected = { type: 'USERS_SET_UPDATED_ITEM', data: data };
    expect(action).toEqual(expected);
  });

  test('removeDeletedItem() will return correct action', () => {
    const data = { id: 87 };
    const action = collection.removeDeletedItem(data);
    const expected = { type: 'USERS_REMOVE_DELETED_ITEM', data: data };
    expect(action).toEqual(expected);
  });

  test('setItemData() will return correct action', () => {
    const data = { id: 87 };
    const action = collection.setItemData(data);
    const expected = { type: 'USERS_SET_ITEM_DATA', data: data };
    expect(action).toEqual(expected);
  });

  test('clear() will return correct action', () => {
    const action = collection.clear(null);
    const expected = { type: 'USERS_CLEAR' };
    expect(action).toEqual(expected);
  });

  test('useCollection() will return collection', () => {
    const collection = apiResourceCollection('comments');
    const resource = getResource(ActionName.GET_ITEM, '/some/url');
    collection.addResource(resource);
    const error: string | undefined = undefined;
    const state = {
      'COMMENTS.GET_RESOURCE_ITEM': {
        data: {},
        isLoading: false,
        isLoaded: false,
        isError: false,
        error
      },
      'COMMENTS.SET_SELECTED_ITEM': {
        data: {},
        isSet: false
      }
    };
    const result = collection.useCollection(state);

    // expected:
    const item = {
      data: {},
      error,
      isError: false,
      isLoaded: false,
      isLoading: false,
      loadingState: LoadingState.INITIAL
    };
    const selectedItem = {
      data: {},
      isSet: false,
      loadingState: LoadingState.INITIAL
    };
    expect(result.item).toEqual(item);
    expect(result.selectedItem).toEqual(selectedItem);
  });
});
