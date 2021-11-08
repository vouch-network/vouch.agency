import type { Hash, Base64String, Base64Hash } from 'utils/crypto';

type InputObj = { [key: string]: any };

export function encode<T extends Hash | InputObj>(
  obj: T
): T extends Hash ? Base64Hash : Base64String {
  const str = JSON.stringify(obj);

  if (process.browser) {
    return btoa(str);
  } else {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
}

export function decode(str: Base64Hash | Base64String): InputObj {
  let decoded = '';

  if (process.browser) {
    decoded = atob(str);
  } else {
    decoded = Buffer.from(str, 'base64').toString('utf-8');
  }

  return JSON.parse(decoded);
}
