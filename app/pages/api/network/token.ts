import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { withAuthApiUser, getUser } from 'lib/auth';
import { id, email } from 'utils/gunDB';

const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY?.trim();

if (!APP_PRIVATE_KEY) {
  throw new Error('APP_PRIVATE_KEY in env variables required');
}

// Get access token to allow `.put` access to gunDB
const tokenHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'GET') {
    const user = getUser(req)!;

    const idPath = id(user.id);
    const emailPath = email(user.email);

    // Allow `.put` to path if path or subpath includes id or email
    // All these will work:
    //  gun.get('id:id_1').put('something')
    //  gun.get('id:id_1/profile').put('something')
    //  gun.get('username:username_1').get('id:id_1').put('something')
    //  gun.get('username:username_1').get('id:id_1').get('something').put('something')
    const permissions = `{**/+(${idPath}|${emailPath})/**,**/+(${idPath}|${emailPath})}`;
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
