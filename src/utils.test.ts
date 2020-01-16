import {
  getAuthHeader,
  snakeCase,
  getFormattedActionName,
  HttpMethod,
  isValidBody,
  getHeaders,
  jsonHeaders,
  getMethod,
  getAPIRequestOptions,
  splitHeader,
  getPairsObject
} from './utils';

describe('getPairsObject', () => {
  const pairs = ['name1=value1', 'name2=value2'];
  const expected = {
    name1: 'value1',
    name2: 'value2'
  };
  test('2 pairs', () => {
    expect(getPairsObject(pairs)).toEqual(expected);
  });
  test('no delimiter present', () => {
    expect(getPairsObject(pairs, ',')).toEqual({});
  });
  const pairs2 = ['name1/value1', 'name2/value2'];
  test('different delimiter set', () => {
    expect(getPairsObject(pairs2, '/')).toEqual(expected);
  });
});

describe('splitHeader', () => {
  test('delimiters present', () => {
    const header = 'name1=value1; name2=value2';
    const expected = ['name1=value1', 'name2=value2'];
    expect(splitHeader(header)).toEqual(expected);
  });
  test('no delimiters present', () => {
    const header = 'name1=value1, name2=value2';
    const expected = ['name1=value1, name2=value2'];
    expect(splitHeader(header)).toEqual(expected);
  });
  test('different delimiter used', () => {
    const header = 'name1=value1 | name2=value2';
    const expected = ['name1=value1', 'name2=value2'];
    expect(splitHeader(header, '|')).toEqual(expected);
  });
});

describe('snakeCase', () => {
  test('camelCase', () => {
    expect(snakeCase('camelCase')).toEqual('camel_case');
  });

  test('camelCaseTwo', () => {
    expect(snakeCase('camelCaseTwo')).toEqual('camel_case_two');
  });

  test('camelCaseANOTHER', () => {
    expect(snakeCase('camelCaseANOTHER')).toEqual('camel_case_another');
  });

  test('PascalCase', () => {
    expect(snakeCase('PascalCase')).toEqual('pascal_case');
  });
});

describe('getFormattedActionName', () => {
  test('camelCase', () => {
    expect(getFormattedActionName('camelCase')).toEqual('CAMEL_CASE');
  });
});

describe('getAuthHeader', () => {
  let token: string | undefined = undefined;
  let expected = {};

  test('undefined token', () => {
    expect(getAuthHeader(token)).toEqual(expected);
  });

  test('string token', () => {
    token = 'uy143uy13h13j98asv9er9';
    expected = { Authorization: `Bearer ${token}` };
    expect(getAuthHeader(token)).toEqual(expected);
  });
});

describe('isValidBody', () => {
  test('get', () => {
    expect(isValidBody('get')).toEqual(false);
  });
  test('get, {}', () => {
    expect(isValidBody('get', {})).toEqual(false);
  });
  test('put, {}', () => {
    expect(isValidBody('put', {})).toEqual(true);
  });
  test('post, {}', () => {
    expect(isValidBody('post', {})).toEqual(true);
  });
  test('PATCH, {}', () => {
    expect(isValidBody('PATCH', {})).toEqual(true);
  });
  test('DELETE, {}', () => {
    expect(isValidBody('DELETE', {})).toEqual(true);
  });
  test('post, null', () => {
    expect(isValidBody('post')).toEqual(false);
  });
});

describe('getHeaders', () => {
  test('no input', () => {
    expect(getHeaders()).toEqual(new Headers({}));
  });
  test('empty {} input', () => {
    expect(getHeaders({}, {}, {})).toEqual(new Headers({}));
  });
  test('combine 3 different headers', () => {
    expect(
      getHeaders({ header1: 'header 1 value' }, { header2: 'header 2 value' }, { header3: 'header 3 value' })
    ).toEqual(new Headers({ header1: 'header 1 value', header2: 'header 2 value', header3: 'header 3 value' }));
  });
  test('overwrite default headers', () => {
    expect(
      getHeaders(
        { header1: 'header 1 new value' },
        { header2: 'header 2 new value' },
        { header1: 'header 1 value', header2: 'header 2 value' }
      )
    ).toEqual(new Headers({ header1: 'header 1 new value', header2: 'header 2 new value' }));
  });
});

describe('getMethod', () => {
  test('get', () => {
    expect(getMethod('get')).toEqual('GET');
  });
  test('GET', () => {
    expect(getMethod('GET')).toEqual('GET');
  });
  test('PUT', () => {
    expect(getMethod('PUT')).toEqual('PUT');
  });
  test('PATCH', () => {
    expect(getMethod('PATCH')).toEqual('PATCH');
  });
  test('POST', () => {
    expect(getMethod('POST')).toEqual('POST');
  });
  test('DELETE', () => {
    expect(getMethod('DELETE')).toEqual('DELETE');
  });
  test('empty input - should throw error', () => {
    expect(() => {
      getMethod('');
    }).toThrowError('Invalid HTTP Method');
  });
});

describe('getAPIRequestOptions', () => {
  test('GET/no body', () => {
    const method = HttpMethod.GET;
    const expected = {
      method,
      headers: new Headers(jsonHeaders)
    };
    expect(getAPIRequestOptions(method, {})).toEqual(expected);
  });
  test('POST/empty body', () => {
    const method = HttpMethod.POST;
    const body = '{}';
    const expected = {
      method,
      body,
      headers: new Headers(jsonHeaders)
    };
    expect(getAPIRequestOptions(method, {})).toEqual(expected);
  });

  test('POST/empty body/extra header', () => {
    const method = HttpMethod.POST;
    const body = '{}';
    const header = { header: 'some header content' };
    const expected = {
      method,
      body,
      headers: new Headers({ ...jsonHeaders, ...header })
    };
    expect(getAPIRequestOptions(method, {}, header)).toEqual(expected);
  });

  test('PUT/body/auth header', () => {
    const method = HttpMethod.PUT;
    const body = { userId: 2 };
    const token = 'n43i6247o247o24';
    const authHeader = getAuthHeader(token);
    const expected = {
      method,
      body: JSON.stringify(body),
      headers: new Headers({ ...jsonHeaders, ...authHeader })
    };
    expect(getAPIRequestOptions(method, body, {}, token)).toEqual(expected);
  });
});
