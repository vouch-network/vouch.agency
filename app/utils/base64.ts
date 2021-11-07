export function encode(obj: { [key: string]: any }): string {
  const str = JSON.stringify(obj);

  if (process.browser) {
    return btoa(str);
  } else {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
}

export function decode(str: string): { [key: string]: any } {
  let decoded = '';

  if (process.browser) {
    decoded = atob(str);
  } else {
    decoded = Buffer.from(str, 'base64').toString('utf-8');
  }

  return JSON.parse(decoded);
}
