import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { getUser, NextIronRequest } from 'lib/session';

if (!process.env.APP_ACCESS_TOKEN_SECRET) {
  throw new Error('APP_ACCESS_TOKEN_SECRET in env environment required');
}

const APP_ACCESS_TOKEN_SECRET = process.env.APP_ACCESS_TOKEN_SECRET;

const tokensHandler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'POST') {
    const { username, pub } = getUser(req);

    const token = jwt.sign({ username, pub }, APP_ACCESS_TOKEN_SECRET, {
      expiresIn: '2h',
    });

    res.status(201).send({
      accessToken: token,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default tokensHandler;
