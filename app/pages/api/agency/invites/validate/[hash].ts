import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

const INVITE_SECRET = process.env.INVITE_SECRET;

import withSlowDown from 'lib/withSlowDown';

const validateInviteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { query, body, method } = req;

  if (method === 'POST') {
    if (!INVITE_SECRET) {
      throw new Error('App misconfiguration');
    }

    const hmac = crypto.createHmac('sha256', INVITE_SECRET);

    hmac.update(
      JSON.stringify({
        username: body.username,
        passcode: body.passcode,
        expiresAt: Number(body.expiresAt),
      })
    );

    const computedHash = hmac.digest('hex');

    res.status(200).json({
      isValid: query.hash === computedHash,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withSlowDown()(validateInviteHandler);
