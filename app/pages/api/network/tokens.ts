import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { withAuthApiUser, withAuthApi, getUser } from 'lib/auth';
import { GUN_PREFIX, GUN_PATH, GUN_KEY } from 'utils/constants';

if (!process.env.APP_ACCESS_TOKEN_SECRET) {
  throw new Error('APP_ACCESS_TOKEN_SECRET in env environment required');
}

if (!process.env.APP_ENCRYPTION_SECRET) {
  throw new Error('APP_ENCRYPTION_SECRET in env environment required');
}

// Create token to allow `.put` access to gunDB
const tokensHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'POST') {
    const { id } = getUser(req)!;

    // Allow `.put` to path if path or subpath matches glob
    const permissionsGlobs = [
      // e.g. gun.get('id:id_1').put('something')
      `${GUN_PREFIX.id}:${id}`,
      // e.g. gun.get('id:id_1/profile').put('something')
      `${GUN_PREFIX.id}:${id}/*`,
      // e.g. gun.get('username:username_1').get('id:id_1').put('something')
      `*/${GUN_PREFIX.id}:${id}`,
      // e.g. gun.get('username:username_1').get('id:id_1').get('something').put('something')
      `*/${GUN_PREFIX.id}:${id}/*`,
    ];

    const permissions = `{${permissionsGlobs.join(',')}}`;

    const token = jwt.sign(
      {
        permissions,
      },
      process.env.APP_ACCESS_TOKEN_SECRET!,
      {
        expiresIn: '2h',
      }
    );

    res.status(201).json({
      accessToken: token,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuthApiUser(tokensHandler);
