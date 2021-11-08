import { NextApiRequest, NextApiResponse } from 'next';

import { getTokenFromHeader, isTokenValid, getUserByToken } from 'lib/auth';
import type { AuthMetadata } from 'utils/auth';

// Get user metadata from an identity token
// Useful in the case when when we want to check token metadata
// before fully authenticating the user
const identityMetadataHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method, headers } = req;

  if (method === 'GET') {
    const data: AuthMetadata = {
      authenticated: false,
      user: null,
    };

    const identityToken = getTokenFromHeader(headers);

    if (identityToken) {
      data.authenticated = isTokenValid(identityToken);
      data.user = await getUserByToken(identityToken);
    }

    res.status(201).send(data);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default identityMetadataHandler;
