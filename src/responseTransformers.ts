export interface ResponseTransformer {
  (response: Response): any;
}

export const transformResponseData: ResponseTransformer = async (response: Response) => {
  try {
    const json = await response.json();
    return json.data || json || null;
  } catch (error) {
    return null;
  }
};
