import { GUN_PATH, GUN_KEY } from 'utils/constants';

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
  Object.keys(value).reduce((acc, key) => {
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
  }, {});
