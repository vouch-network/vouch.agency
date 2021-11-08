import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { withAuthApiUser, getUser } from 'lib/auth';
import { GUN_PREFIX, GUN_PATH, GUN_KEY } from 'utils/constants';

const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY?.trim();

if (!APP_PRIVATE_KEY) {
  throw new Error('APP_PRIVATE_KEY in env environment required');
}

// Get access token to allow `.put` access to gunDB
const tokenHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'GET') {
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
      APP_PRIVATE_KEY!,
      {
        algorithm: 'RS256',
        expiresIn: '2h',
      }
    );

    res.status(200).json({
      accessToken: token,
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuthApiUser(tokenHandler);
