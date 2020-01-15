import memoize from 'moize';

export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export const splitHeader: (header: string, delimiter?: string) => string[] = (header, delimiter = ';') => {
  return header.split(delimiter).map(pair => pair.trim());
};

export const getPairsObject: (pairs: string[], delimiter?: string) => any = (pairs, delimiter = '=') => {
  const data: any = {};
  pairs.forEach(pair => {
    const [key, value] = pair.split(delimiter);
    data[key] = value;
  });
  return data;
};

export interface RequestOptions {
  method: HttpMethod;
  headers: any;
  body?: string;
}

export const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

export const getFormattedActionName: (str: string) => string = memoize((str: string) => {
  return snakeCase(str).toUpperCase();
});

export const snakeCase: (str: string) => string = memoize((str: string) => {
  return str
    .replace(/[-\s]+/g, '_')
    .replace(/^_(.+)_$/g, '$1')
    .replace(/([a-z]{1})([A-Z]{1})/g, '$1_$2')
    .toLowerCase();
});

export const getAuthHeader: (token: string | undefined) => object = memoize((token: string | undefined = undefined) => {
  return token !== undefined ? { Authorization: `Bearer ${token}` } : {};
});

export const isValidBody: (method: string, body?: object | undefined) => boolean = (method, body) => {
  return method.toUpperCase() !== HttpMethod.GET && body !== undefined;
};

export const getHeaders: (
  headers?: object | undefined,
  authHeader?: object | undefined,
  defaultHeaders?: object | undefined
) => any = (headers, authHeader, defaultHeaders) => {
  const combinedHeaders: any = Object.assign({}, defaultHeaders || {}, headers || {}, authHeader || {});
  return new Headers(combinedHeaders);
};

export const getMethod: (method: string) => HttpMethod = memoize(method => {
  method = method.toUpperCase();
  switch (method) {
    case HttpMethod.GET:
    case HttpMethod.PUT:
    case HttpMethod.PATCH:
    case HttpMethod.POST:
    case HttpMethod.DELETE:
      return method;
    default:
      throw new Error('Invalid HTTP Method');
  }
});

export const getAPIRequestOptions: (
  method: HttpMethod,
  body?: any,
  headers?: object,
  token?: string | undefined
) => RequestOptions = memoize(
  (method, body = undefined, headers = {}, token = undefined): RequestOptions => {
    return {
      method: getMethod(method),
      headers: getHeaders(headers, getAuthHeader(token), jsonHeaders),
      ...(isValidBody(method, body) && { body: JSON.stringify(body) })
    };
  }
);
