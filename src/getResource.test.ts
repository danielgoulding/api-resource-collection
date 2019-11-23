import getResource, {
  getTransforms,
  getDefaultData,
  getDefaultMethod,
  getMethod,
  defaultDataNames,
  getDataName,
  getType
} from './getResource';
import { objKeyValues, arrObjectValues, noTransform, DataTransform } from './dataTransforms';
import { ResourceType, ActionName } from './constants.const';
import { HttpMethod } from './utils';

describe('getTransforms', () => {
  test('for multiple items, return transforms', () => {
    const expected = [objKeyValues, arrObjectValues];
    expect(getTransforms(ResourceType.MULTIPLE_ITEMS)).toEqual(expected);
  });
  test('for any other resource type, return noTransforms', () => {
    const expected = [noTransform, noTransform];
    expect(getTransforms(ResourceType.SINGLE_ITEM)).toEqual(expected);
  });
});

describe('getDefaultData', () => {
  test('for multiple items, return default array []', () => {
    expect(getDefaultData(ResourceType.MULTIPLE_ITEMS)).toEqual([]);
  });
  test('for single item, return default object {}', () => {
    expect(getDefaultData(ResourceType.SINGLE_ITEM)).toEqual({});
  });
});

describe('getDefaultMethod', () => {
  test('create => post', () => {
    expect(getDefaultMethod(ActionName.CREATE_ITEM)).toEqual(HttpMethod.POST);
  });
  test('update => put', () => {
    expect(getDefaultMethod(ActionName.UPDATE_ITEM)).toEqual(HttpMethod.PUT);
  });
  test('modify => patch', () => {
    expect(getDefaultMethod(ActionName.MODIFY_ITEM)).toEqual(HttpMethod.PATCH);
  });
  test('delete => delete', () => {
    expect(getDefaultMethod(ActionName.DELETE_ITEM)).toEqual(HttpMethod.DELETE);
  });
  test('get items => get', () => {
    expect(getDefaultMethod(ActionName.GET_ITEMS)).toEqual(HttpMethod.GET);
  });
  test('get item => get', () => {
    expect(getDefaultMethod(ActionName.GET_ITEM)).toEqual(HttpMethod.GET);
  });
  test('default => get', () => {
    expect(getDefaultMethod('')).toEqual(HttpMethod.GET);
  });
});

describe('getMethod', () => {
  test('if method matches, return method', () => {
    expect(getMethod(HttpMethod.GET, ActionName.GET_ITEM)).toEqual(HttpMethod.GET);
  });
  test("if method doesn't match, return GET for get item", () => {
    expect(getMethod(undefined, ActionName.GET_ITEM)).toEqual(HttpMethod.GET);
  });
  test("if method doesn't match, return POST for create item", () => {
    expect(getMethod(undefined, ActionName.CREATE_ITEM)).toEqual(HttpMethod.POST);
  });
});

describe('getDataName', () => {
  test('for action CREATE_ITEM use name createdItem', () => {
    expect(getDataName(ActionName.CREATE_ITEM)).toEqual('createdItem');
  });
  test('for action UPDATE_ITEM use name updatedItem', () => {
    expect(getDataName(ActionName.UPDATE_ITEM)).toEqual('updatedItem');
  });
  test('for action MODIFY_ITEM use name modifiedItem', () => {
    expect(getDataName(ActionName.MODIFY_ITEM)).toEqual('modifiedItem');
  });
  test('for action DELETE_ITEM use name deletedItem', () => {
    expect(getDataName(ActionName.DELETE_ITEM)).toEqual('deletedItem');
  });
  test('for action GET_ITEMS use name items', () => {
    expect(getDataName(ActionName.GET_ITEMS)).toEqual('items');
  });
  test('for action GET_ITEM use name item', () => {
    expect(getDataName(ActionName.GET_ITEM)).toEqual('item');
  });
  test('for action SET_SELECTED_ITEM use name selectedItem', () => {
    expect(getDataName(ActionName.SET_SELECTED_ITEM)).toEqual('selectedItem');
  });
  test('for bespoke action registerLearner use same name: registerLearner', () => {
    expect(getDataName('registerLearner')).toEqual('registerLearner');
  });
});

describe('getType', () => {
  test('if defined type matches, return defined type', () => {
    expect(getType(ResourceType.MULTIPLE_ITEMS, ActionName.GET_ITEMS)).toEqual(ResourceType.MULTIPLE_ITEMS);
    expect(getType(ResourceType.SINGLE_ITEM, ActionName.GET_ITEM)).toEqual(ResourceType.SINGLE_ITEM);
  });
  test("if defined type doesn't match, return default type", () => {
    expect(getType('invalidEntry', ActionName.GET_ITEMS)).toEqual(ResourceType.MULTIPLE_ITEMS);
    expect(getType('invalidEntry', 'registerlearner')).toEqual(ResourceType.SINGLE_ITEM);
  });
});

const dt: DataTransform = data => {
  return data.prop;
};

describe('getResource', () => {
  test('api resource', () => {
    const actionName = 'registerUser';
    const endpoint = '/some/url/:userId';
    const options = {
      method: HttpMethod.POST,
      dataName: 'registeredUser',
      type: ResourceType.SINGLE_ITEM,
      defaultData: {},
      transforms: [dt, dt],
      headers: { headerName: 'headerValue' }
    };
    const expected = {
      actionName: 'REGISTER_USER',
      dataName: 'registeredUser',
      defaultData: {},
      endpoint: '/some/url/:userId',
      headers: {
        headerName: 'headerValue'
      },
      isAPIResource: true,
      method: 'POST',
      transforms: [dt, dt],
      type: 'SINGLE_ITEM'
    };
    expect(getResource(actionName, endpoint, options)).toEqual(expected);
  });

  test('not api resource', () => {
    const actionName = 'doSomething';
    const endpoint: string | undefined = undefined;
    const expected = {
      actionName: 'DO_SOMETHING',
      dataName: 'doSomething',
      defaultData: {},
      endpoint,
      headers: {},
      isAPIResource: false,
      method: 'GET',
      transforms: [noTransform, noTransform],
      type: 'SINGLE_ITEM'
    };
    expect(getResource(actionName, undefined)).toEqual(expected);
  });
});
