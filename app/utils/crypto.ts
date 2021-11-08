export type Base64String = string;

export type Hash = {
  iv: string;
  content: string;
  // optional name to identity the secret key that was used
  name?: string;
};

export type Base64Hash = string;
