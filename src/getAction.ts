import memoize from 'moize';

export interface DataAction {
  type: string;
  data?: any;
}

export const getAction: (type: string, data?: any) => DataAction = memoize((type, data = null) => {
  return {
    type,
    ...(data !== null && { data: data })
  };
});
