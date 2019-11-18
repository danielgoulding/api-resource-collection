import memoize from 'moize';

export type DataTransform = (data: any) => any;

export interface ObjectWithID {
  id: string | number;
  [propName: string]: any;
}

export const objKeyValues: DataTransform = memoize((data: ObjectWithID[]) => {
  const obj: any = {};
  data.forEach((item: ObjectWithID) => {
    const key = String(item.id);
    obj[key] = item;
  });
  return obj;
});

export const arrObjectValues: DataTransform = memoize(data => {
  return Object.values(data);
});

export const noTransform: DataTransform = memoize(data => data);

export const transformArrayToObject: DataTransform[] = [objKeyValues, arrObjectValues];
