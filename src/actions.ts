import memoize from 'moize';

import { getReducerState } from './reducers';
import { getAPIRequestOptions, RequestOptions } from './utils';
import { Resource } from './getResource';
import { RequestStatus } from './constants.const';
import { getAction } from './getAction';
import { ResponseTransformer, transformResponseData } from './responseTransformers';

export const getAPIAction: (
  resourceName: string,
  options: any,
  resource: Resource,
  body: any,
  values: any,
  headers: any
) => Function = memoize(
  (resourceName: string, options: any, resource: Resource, body: any, values: any, headers: any) => {
    return async (dispatch: Function): Promise<APIResponse> => {
      // dispatch request status:
      dispatchStatus(dispatch, resource.actionName, resourceName, RequestStatus.REQUEST);

      // get dynamic properties injected into endpoint url:
      const endpointURL: string = getEndpoint(resource.endpoint || '', options, values);

      // generate api request options:
      const apiOptions: RequestOptions = getAPIRequestOptions(resource.method, body, headers, options.token);

      // get response from API:
      const response: APIResponse = await getResponse(
        endpointURL,
        apiOptions,
        resource.defaultData,
        resource.responseTransformer
      );

      // set dispatch data:
      const type: RequestStatus = response.ok ? RequestStatus.SUCCESS : RequestStatus.FAILURE;
      const payload: any = response.ok ? response.data : response.statusText;

      // dispatch success:
      dispatchStatus(dispatch, resource.actionName, resourceName, type, payload);

      // return response:
      return response;
    };
  }
);

// find any :prop in endpoint and replace with and prop of same name in options or values:
export const getEndpoint: (endpoint: string, options?: any, values?: any) => string = memoize(
  (endpoint, options, values = undefined) => {
    const matches: string[] | null = endpoint.match(/:(\w+)/g);
    if (matches !== null) {
      matches.forEach((match: string) => {
        const propName: string = match.replace(':', '');
        const propValue: string =
          values && values[propName] ? values[propName] : options && options[propName] ? options[propName] : match;
        endpoint = endpoint.replace(match, propValue);
      });
    }
    return endpoint;
  }
);

export const dispatchStatus: (
  dispatch: Function,
  opName: string,
  resourceName: string,
  status?: RequestStatus | undefined,
  data?: any
) => void = (dispatch, opName, resourceName, status = undefined, data = undefined) => {
  let requestState: string = getReducerState(opName, resourceName, status);
  dispatch(getAction(requestState, data));
};

export interface APIResponse {
  ok: boolean;
  status: number;
  statusText: string;
  error: string | undefined;
  data: any;
  response: any;
}

export const getResponse: (
  endpointURL: string,
  apiOptions: any,
  defaultData: any,
  transformer: ResponseTransformer
) => Promise<APIResponse> = async (
  endpointURL: string,
  apiOptions: any,
  defaultData: any,
  transformer: ResponseTransformer
) => {
  const apiResponse: Response = await getAPIResponse(endpointURL, apiOptions);
  let data: any = await getResponseData(apiResponse, defaultData, transformer);
  return {
    ok: apiResponse.ok,
    status: Number(apiResponse.status),
    statusText: apiResponse.statusText,
    error: apiResponse.ok ? undefined : apiResponse.statusText,
    data: data,
    response: apiResponse
  };
};

export const getAPIResponse: (endpointURL: string, apiOptions: any) => Promise<Response> = async (
  endpointURL: string,
  apiOptions: any
) => {
  try {
    return await fetch(endpointURL, apiOptions);
  } catch (error) {
    return new Response(null, { status: 444, statusText: error.toString() });
  }
};

export const getResponseData: (
  response: Response,
  defaultData: any,
  transformer: ResponseTransformer
) => Promise<any> = async (response, defaultData, transformer = transformResponseData) => {
  if (!response.ok) {
    return defaultData;
  }
  return (await transformer(response)) || defaultData;
};
