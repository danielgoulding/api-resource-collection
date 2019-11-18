import { objKeyValues, arrObjectValues, noTransform } from './dataTransforms';

describe('objKeyValues', () => {
  test('converts array of objects to dictionary', () => {
    const input = [
      { id: 1, label: 'item 1' },
      { id: 2, label: 'item 2' },
      { id: 3, label: 'item 3' },
      { id: 4, label: 'item 4' }
    ];
    const expected = {
      ['1']: { id: 1, label: 'item 1' },
      ['2']: { id: 2, label: 'item 2' },
      ['3']: { id: 3, label: 'item 3' },
      ['4']: { id: 4, label: 'item 4' }
    };
    expect(objKeyValues(input)).toEqual(expected);
  });
});

describe('arrObjectValues', () => {
  test('returns array of values', () => {
    const input = {
      ['1']: { id: 1, label: 'item 1' },
      ['2']: { id: 2, label: 'item 2' },
      ['3']: { id: 3, label: 'item 3' },
      ['4']: { id: 4, label: 'item 4' }
    };
    const expected = [
      { id: 1, label: 'item 1' },
      { id: 2, label: 'item 2' },
      { id: 3, label: 'item 3' },
      { id: 4, label: 'item 4' }
    ];
    expect(arrObjectValues(input)).toEqual(expected);
  });
});

describe('noTransform', () => {
  test('does nothing to data input', () => {
    const input = { id: 1, label: 'item 1' };
    expect(noTransform(input)).toEqual(input);
  });
});
