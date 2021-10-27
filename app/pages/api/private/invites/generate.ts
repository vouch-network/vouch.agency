import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

import withSession, { getUser, NextIronRequest } from 'lib/session';

const INVITE_SECRET = process.env.INVITE_SECRET;

const generateInviteHandler = async (
  req: NextIronRequest,
  res: NextApiResponse
) => {
  const { query, method } = req;

  const user = getUser(req);

  if (!user) {
    res.status(401).send({ message: 'Unauthorized' });
  }

  if (method === 'GET') {
    if (!INVITE_SECRET) {
      throw new Error('App misconfiguration');
    }
    const passcode = crypto.randomInt(100000, 1000000).toString();
    const hmac = crypto.createHmac('sha256', INVITE_SECRET);

    const expiresAt = Number(query.expiresAt);

    hmac.update(
      JSON.stringify({
        username: user.username,
        passcode,
        expiresAt,
      })
    );

    const hash = hmac.digest('hex');

    res.status(200).json({
      invite_url: `${process.env.NEXT_PUBLIC_BASE_URL}/network/invite/${hash}?t=${query.expiresAt}`,
      passcode,
      expiresAt,
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withSession(generateInviteHandler);
