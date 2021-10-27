import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
// import { ManagementClient } from 'auth0';

const INVITE_SECRET = process.env.INVITE_SECRET;

const validateInviteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { query, body, method } = req;

  // const session = await getSession(req, res);

  // if (!session) {
  //   throw new Error('Session not found');
  // }

  // const id = session.user.sub;
  // const accessToken = session.accessToken;

  if (method === 'POST') {
    if (!INVITE_SECRET) {
      throw new Error('App misconfiguration');
    }

    // const currentUserManagementClient = new ManagementClient({
    //   token: accessToken,
    //   domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
    //   scope: process.env.AUTH0_SCOPE,
    // });

    // const user = await currentUserManagementClient.getUser({
    //   id: id as string,
    // });

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

// export default withApiAuthRequired(validateInviteHandler);
export default validateInviteHandler;
