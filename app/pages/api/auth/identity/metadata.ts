import { NextApiRequest, NextApiResponse } from 'next';

import { withAuthApiUser, NextApiRequestWithSession } from 'lib/auth';

// Get user metadata from an identity token
// Useful in the case when when we want to check token metadata
// before fully authenticating the user
const identityMetadataHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method, headers } = req;

  if (method === 'GET') {
    const user = (req as NextApiRequestWithSession).session?.user || {};

    res.status(201).send({ user });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuthApiUser(identityMetadataHandler);
