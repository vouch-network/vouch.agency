import { GUN_PREFIX, GUN_KEY } from 'utils/constants';

// prepare form values before saving to gunDB
export const prepareFormValues = (value: any) =>
  Object.keys(value).reduce((acc, key) => {
    if (typeof value[key] === 'undefined') {
      return acc;
    }

    // @ts-ignore
    const dbKey = GUN_KEY[key];

    if (!dbKey) {
      console.debug(`gunDB key doesn't exist: ${key}, not saving`);
      return acc;
    }

    return {
      ...acc,
      [dbKey]: value[key],
    };
  }, {});

// expand terse gunDB keys
const swappedKeyMap = Object.keys(GUN_KEY).reduce(
  (acc, key) => ({
    ...acc,
    // @ts-ignore
    [GUN_KEY[key]]: key,
  }),
  {}
);

export const expandDataKeys = (value: any) =>
  value
    ? Object.keys(value).reduce((acc, key) => {
        if (typeof value[key] === 'undefined') {
          return acc;
        }

        // @ts-ignore
        const expandedKey = swappedKeyMap[key];

        if (!expandedKey) {
          return acc;
        }

        return {
          ...acc,
          [expandedKey]: value[key],
        };
      }, {})
    : {};

// Parse ID from path, e.g. `id:some_id`
export const parseId = (value: string): string =>
  typeof value === 'string' ? value.slice(GUN_PREFIX.id.length + 1) : '';
