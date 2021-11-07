import axios from 'axios';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Magic } from '@magic-sdk/admin';

import { AuthUser, AuthSession } from 'utils/auth';

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

export type NextApiRequestWithSession = NextApiRequest & {
  session: AuthSession;
};

export function getUser(req: NextApiRequest): AuthUser {
  return (req as NextApiRequestWithSession).session?.user;
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
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const identityToken =
        await AuthAdminService.client.utils.parseAuthorizationHeader(
          authHeader
        );

      try {
        await AuthAdminService.client.token.validate(identityToken);

        handler(req, res);
      } catch {
        sendUnauthenticatedResponse(res);
      }
    } else {
      sendUnauthenticatedResponse(res);
    }
  };
}

export function withAuthApiUser(handler: NextApiHandler) {
  return withAuthApi(async function handlerWithAuthUser(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const authHeader = req.headers.authorization!;

      const identityToken =
        AuthAdminService.client.utils.parseAuthorizationHeader(authHeader);

      // FIXME this causes "API resolved without sending a response"
      // but it seems like we're still getting the metadata
      const metadata = await AuthAdminService.client.users.getMetadataByToken(
        identityToken
      );
      // const [, claim] = AuthAdminService.client.token.decode(identityToken);
      // const issuer = claim.iss;

      const user: AuthUser = {
        id: metadata.issuer as string,
        email: metadata.email as string,
      };

      (req as NextApiRequestWithSession).session = { user };

      handler(req, res);
    } catch {
      sendUnauthenticatedResponse(res);
    }
  });
}
