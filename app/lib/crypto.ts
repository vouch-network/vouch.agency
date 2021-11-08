import crypto from 'crypto';

import type { Hash } from 'utils/crypto';

if (!process.env.APP_CRYPTO_SECRET) {
  throw new Error('APP_CRYPTO_SECRET in env environment required');
}

// Encrypt/decrypt functions based on
// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
const algorithm = 'aes-256-ctr';

// Encrypt some data that can be decrypted later
export function encrypt(data: string | { [key: string]: any }): Hash {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    process.env.APP_CRYPTO_SECRET!,
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    name: process.env.APP_SECRET_KEY_NAME,
  };
}

// Decrypt encrypted hash blob
export function decrypt(hash: Hash): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.APP_CRYPTO_SECRET!,
    Buffer.from(hash.iv, 'hex')
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
}

// One-way hashing--cannot be decoded later
export function hash(value: any): string {
  const hmac = crypto.createHmac('sha256', process.env.APP_CRYPTO_SECRET!);

  hmac.update(value);

  return hmac.digest('hex');
}

// Safely compare values
export function compare(a: string, b: string) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generatePasscode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}
