import memoize from 'moize';

import { ActionName, ResourceType } from './constants.const';
import { objKeyValues, arrObjectValues, noTransform, DataTransform } from './dataTransforms';
import { getFormattedActionName, HttpMethod, getMethod as getHttpMethod } from './utils';

export interface ResourceOptions {
  method?: HttpMethod;
  dataName?: string;
  type?: ResourceType;
  defaultData?: [] | {};
  transforms?: DataTransform[];
  headers?: any;
}

export interface Resource {
  actionName: string;
  endpoint: string | undefined;
  method: HttpMethod;
  transforms: DataTransform[];
  defaultData: [] | {};
  dataName: string;
  type: ResourceType;
  isAPIResource: boolean;
  headers: any;
}

export const getResource: (
  actionName: string,
  endpoint?: string | undefined,
  options?: ResourceOptions
) => Resource = memoize((actionName, endpoint = undefined, options = {}) => {
  const formattedActionName = getFormattedActionName(actionName);
  const method: HttpMethod = getMethod(options.method, actionName);
  const dataName: string = options.dataName || getDataName(actionName);
  const type: ResourceType = getType(options.type, actionName);
  const defaultData: [] | {} = options.defaultData || getDefaultData(type);
  const transforms: DataTransform[] = options.transforms || getTransforms(type);
  const isAPIResource: boolean = endpoint !== undefined;
  const headers: object = options.headers || {};
  return {
    actionName: formattedActionName,
    endpoint,
    method,
    transforms,
    defaultData,
    dataName,
    type,
    isAPIResource,
    headers
  };
});

export const getTransforms: (resourceType: ResourceType) => [DataTransform, DataTransform] = memoize(resourceType => {
  return resourceType === ResourceType.MULTIPLE_ITEMS ? [objKeyValues, arrObjectValues] : [noTransform, noTransform];
});

export const getDefaultData: (resourceType: ResourceType) => [] | {} = memoize(resourceType => {
  return resourceType === ResourceType.MULTIPLE_ITEMS ? [] : {};
});

export const getDefaultMethod: (actionName: string) => HttpMethod = memoize((actionName: string) => {
  switch (actionName) {
    case ActionName.CREATE_ITEM:
      return HttpMethod.POST;
    case ActionName.UPDATE_ITEM:
      return HttpMethod.PUT;
    case ActionName.MODIFY_ITEM:
      return HttpMethod.PATCH;
    case ActionName.DELETE_ITEM:
      return HttpMethod.DELETE;
    case ActionName.GET_ITEMS:
    case ActionName.GET_ITEM:
    default:
      return HttpMethod.GET;
  }
});

export const getMethod: (method: any, actionName: string) => HttpMethod = memoize((method, actionName) => {
  try {
    return getHttpMethod(method);
  } catch (error) {
    return getDefaultMethod(actionName);
  }
});

export const defaultDataNames = {
  [ActionName.CREATE_ITEM as string]: 'createdItem',
  [ActionName.UPDATE_ITEM as string]: 'updatedItem',
  [ActionName.MODIFY_ITEM as string]: 'modifiedItem',
  [ActionName.DELETE_ITEM as string]: 'deletedItem',
  [ActionName.GET_ITEMS as string]: 'items',
  [ActionName.GET_ITEM as string]: 'item',
  [ActionName.SET_SELECTED_ITEM as string]: 'selectedItem'
};

export const getDataName: (str: string) => string = memoize((actionName: string) => {
  return defaultDataNames[actionName] || actionName;
});

export const getType: (type: string | undefined, actionName: string) => ResourceType = memoize((type, actionName) => {
  switch (type) {
    case ResourceType.MULTIPLE_ITEMS:
    case ResourceType.SINGLE_ITEM:
      return type;
    default:
  }
  return actionName === ActionName.GET_ITEMS ? ResourceType.MULTIPLE_ITEMS : ResourceType.SINGLE_ITEM;
});

export default getResource;
