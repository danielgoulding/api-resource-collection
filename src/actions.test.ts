import {
  getAction,
  getEndpoint,
  dispatchStatus,
  getResponse,
  getAPIResponse,
  getResponseData,
  RequestStatus,
  getAPIAction
} from './actions';
import { getReducerState } from './reducers';
import getResource from './getResource';
import { ActionName } from './constants.const';

describe('getAction', () => {
  const actionName = 'ACTION_NAME';
  test('no payload', () => {
    expect(getAction(actionName)).toEqual({ type: actionName });
  });
  test('payload string', () => {
    const payload = 'value';
    expect(getAction(actionName, payload)).toEqual({ type: actionName, data: payload });
  });
  test('payload number', () => {
    const payload = 34;
    expect(getAction(actionName, payload)).toEqual({ type: actionName, data: payload });
  });
  test('payload object', () => {
    const payload = { prop: 'value' };
    expect(getAction(actionName, payload)).toEqual({ type: actionName, data: payload });
  });
});

describe('getEndpoint', () => {
  const endpoint = '/resource/34/user/:userId';
  const userId = 45;

  test('no input: unchanged', () => {
    expect(getEndpoint(endpoint)).toEqual('/resource/34/user/:userId');
  });

  test('userId from options', () => {
    const options = { userId };
    const values = {};
    expect(getEndpoint(endpoint, options, values)).toEqual(`/resource/34/user/${userId}`);
  });
  test('userId from values', () => {
    const options = {};
    const values = { userId };
    expect(getEndpoint(endpoint, options, values)).toEqual(`/resource/34/user/${userId}`);
  });
  test('userId from options and values - use values', () => {
    const options = { userId: 674 };
    const values = { userId };
    expect(getEndpoint(endpoint, options, values)).toEqual(`/resource/34/user/${userId}`);
  });
  test('options and values - use values from both', () => {
    const endpoint = '/resource/34/user/:userId/note/:noteId';
    const options = { userId };
    const noteId = 4563;
    const values = { noteId };
    expect(getEndpoint(endpoint, options, values)).toEqual(`/resource/34/user/${userId}/note/${noteId}`);
  });
});

describe('dispatchStatus', () => {
  const dispatch = jest.fn(action => action);
  const opName = 'OPERATION_NAME';
  const resourceName = 'RESOURCE_NAME';
  const status = RequestStatus.REQUEST;
  const data = { prop: 'value' };
  const requestState = getReducerState(opName, resourceName, status);

  dispatchStatus(dispatch, opName, resourceName, status, data);

  test('dispatch function fired once', () => {
    expect(dispatch.mock.calls.length).toBe(1);
  });

  test('dispatch with correct action', () => {
    const expected = getAction(requestState, data);
    expect(dispatch.mock.calls[0][0]).toBe(expected);
  });
});

describe('getAPIResponse', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  const url = 'https://api.example.com/users';
  it('successful fetch returns Response ok:true', async () => {
    fetchMock.once(JSON.stringify({ data: '12345' }));
    const response = await getAPIResponse(url, {});
    expect(response.ok).toBe(true);
  });

  it('failed fetch returns Response ok:false', async () => {
    fetchMock.mockRejectOnce(new Error());
    const response = await getAPIResponse(url, {});
    expect(response.ok).toBe(false);
  });
});

describe('getResponseData', () => {
  it('response error returns default data: {}', async () => {
    const data = JSON.stringify({ data: { id: 4 } });
    const response = new Response(data, { status: 400 });
    const returnedData = await getResponseData(response, {});
    expect(returnedData).toEqual({});
  });

  it('error using json() returns default data: {[]', async () => {
    const data = JSON.stringify({ data: { id: 4 } });
    const response = new Response(data, { status: 200 });
    response.json = (): any => {
      throw new Error('Problem parsing json');
    };
    const returnedData = await getResponseData(response, []);
    expect(returnedData).toEqual([]);
  });

  it('returns data from body', async () => {
    const data = { id: 4 };
    const response = new Response(JSON.stringify({ data }), { status: 200 });
    const returnedData = await getResponseData(response, []);
    expect(returnedData).toEqual(data);
  });

  it('response data not correct structure - return defaut data', async () => {
    const data = { id: 4 };
    const response = new Response(JSON.stringify(data), { status: 200 });
    const returnedData = await getResponseData(response, {});
    expect(returnedData).toEqual({});
  });
});

describe('getResponse', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  const url = 'https://api.example.com/users';

  it('returns successful response object', async () => {
    const data = { id: '12345' };
    const wrappedData = JSON.stringify({ data });
    fetchMock.once(wrappedData);
    const response = await getResponse(url, {}, {});

    expect(response.ok).toEqual(true);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('OK');
    expect(response.error).toEqual(undefined);
    expect(response.data).toEqual(data);
  });

  it('returns failed response object', async () => {
    const data = { id: '12345' };
    const errorMessage = 'failed...';
    const wrappedData = JSON.stringify({ data });
    fetchMock.mockRejectOnce(new Error(errorMessage));

    const response = await getResponse(url, {}, {});

    expect(response.ok).toEqual(false);
    expect(response.status).toEqual(444);
    expect(response.statusText).toEqual('Error: ' + errorMessage);
    expect(response.error).toEqual('Error: ' + errorMessage);
    expect(response.data).toEqual({});
  });
});

describe('getAPIAction', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  const url = 'https://api.example.com/users';

  const actionName = ActionName.GET_ITEMS;
  const resourceName = 'USERS';
  const resource = getResource(actionName, url);
  const apiAction = getAPIAction(resourceName, {}, resource, {}, {}, {});
  const data = { id: '12345' };
  const wrappedData = JSON.stringify({ data });

  test('successful request', async () => {
    const dispatch = jest.fn(action => action);

    fetchMock.once(wrappedData);

    const response = await apiAction(dispatch);

    const requestState: string = getReducerState(actionName, resourceName, RequestStatus.REQUEST);
    const successState: string = getReducerState(actionName, resourceName, RequestStatus.SUCCESS);

    const action1 = getAction(requestState);
    const action2 = getAction(successState, data);

    expect(dispatch.mock.calls.length).toBe(2);
    expect(dispatch.mock.calls[0][0]).toEqual(action1);
    expect(dispatch.mock.calls[1][0]).toEqual(action2);
    expect(response.ok).toEqual(true);
  });

  test('failed request', async () => {
    const dispatch = jest.fn(action => action);
    const errorMessage = 'Could not get users';

    fetchMock.mockRejectOnce(new Error(errorMessage));

    const response = await apiAction(dispatch);

    const requestState: string = getReducerState(actionName, resourceName, RequestStatus.REQUEST);
    const failedState: string = getReducerState(actionName, resourceName, RequestStatus.FAILURE);

    const action1 = getAction(requestState);
    const action2 = getAction(failedState, 'Error: ' + errorMessage);

    expect(dispatch.mock.calls.length).toBe(2);
    expect(dispatch.mock.calls[0][0]).toEqual(action1);
    expect(dispatch.mock.calls[1][0]).toEqual(action2);
    expect(response.ok).toEqual(false);
  });
});
