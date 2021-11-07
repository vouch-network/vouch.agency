import crypto from 'crypto';
import { Blob } from 'buffer';
import { Web3Storage, Web3File, getFilesFromPath } from 'web3.storage';

import { encrypt } from 'lib/crypto';
import { decrypt } from 'lib/crypto';

// Type supported by web3
type FileLike = Blob & {
  name: string;
  stream: any;
};

export class StorageService {
  private static _client: Web3Storage;

  static get client(): Web3Storage {
    if (!StorageService._client) {
      StorageService.init();
    }

    return StorageService._client;
  }

  private static async decryptFile(file: Blob) {
    const hash = JSON.parse(await file.text());
    const decrypted = decrypt(hash);

    return JSON.parse(decrypted);
  }

  static init(): Web3Storage {
    if (!process.env.WEB3_STORAGE_API_TOKEN) {
      throw new Error('WEB3_STORAGE_API_TOKEN in env environment required');
    }

    const client = new Web3Storage({
      token: process.env.WEB3_STORAGE_API_TOKEN,
    });

    StorageService._client = client;

    return client;
  }

  // Store object in Web3 Storage as an encrypted JSON file
  static async storeEncryptedData({
    data,
    fileName = 'data',
  }: {
    data: any;
    fileName: string;
  }): Promise<string> {
    const encrypted = encrypt(data);
    const file = new Blob([JSON.stringify(encrypted)], {
      type: 'application/json',
    });

    // @ts-ignore TODO fix .name type
    file.name = `${fileName}.json.enc`;

    const cid = await StorageService.client.put([file as FileLike]);

    return cid;
  }

  // Retrieve encrypted JSON file from Web3 Storage and decrypt
  static async retrieveDecryptedData(cid: string): Promise<any[]> {
    const res = await StorageService.client.get(cid);

    if (!res) {
      return [];
    }

    if (!res.ok) {
      throw new Error(
        `failed to get ${cid} - [${res.status}] ${res.statusText}`
      );
    }

    // unpack File objects from the response
    const files = await res.files();

    return Promise.all(files.map(StorageService.decryptFile));
  }
}
