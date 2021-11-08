import axios from 'axios';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Magic } from '@magic-sdk/admin';

import type { AuthUser, AuthSession } from 'utils/auth';
import { identity } from 'lodash';

class AuthAdminService {
  private static _client: Magic;
  static get client() {
    if (!AuthAdminService._client) {
      const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY);

      AuthAdminService._client = magicAdmin;
    }

    return AuthAdminService._client;
  }
}

export type NextApiRequestWithUser = NextApiRequest & AuthSession;

export function getUser(req: NextApiRequest): AuthUser {
  return (req as NextApiRequestWithUser).user;
}

export function getTokenFromHeader(headers: any): string | void {
  const authHeader = headers.authorization;

  if (authHeader) {
    return AuthAdminService.client.utils.parseAuthorizationHeader(authHeader);
  }
}

export function isTokenValid(identityToken: string) {
  try {
    AuthAdminService.client.token.validate(identityToken);

    return true;
  } catch {
    return false;
  }
}

export function getIssuerFromToken(identityToken: string): string {
  const [, claim] = AuthAdminService.client.token.decode(identityToken);
  const issuer = claim.iss;

  return issuer;
}

export async function getUserByToken(identityToken: string): Promise<AuthUser> {
  // FIXME this causes "API resolved without sending a response"
  // but it seems like we're still getting the metadata
  const metadata = await AuthAdminService.client.users.getMetadataByToken(
    identityToken
  );
  // const id = getIssuerFromToken(identityToken);

  return {
    id: metadata.issuer as string,
    email: metadata.email as string,
  };
}

export async function validateRequestToken(
  req: NextApiRequest
): Promise<string> {
  const identityToken = getTokenFromHeader(req.headers);

  if (identityToken) {
    AuthAdminService.client.token.validate(identityToken);

    return identityToken;
  }

  throw new Error('Authorization header required');
}

const sendUnauthenticatedResponse = (res: NextApiResponse) => {
  res.status(401).json({
    statusCode: 401,
    message: 'Auth required',
  });
};

export function withAuthApi(handler: NextApiHandler) {
  return async function handlerWithAuth(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      await validateRequestToken(req);
    } catch {
      return sendUnauthenticatedResponse(res);
    }

    handler(req, res);
  };
}

export function withAuthApiUser(handler: NextApiHandler) {
  return withAuthApi(async function handlerWithAuthUser(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const identityToken = await validateRequestToken(req);

      const user = await getUserByToken(identityToken);

      (req as NextApiRequestWithUser).user = user;
    } catch (err) {
      return sendUnauthenticatedResponse(res);
    }

    handler(req, res);
  });
}
