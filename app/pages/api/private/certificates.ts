import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import SEA from 'gun/sea';

import { getUser, NextIronRequest } from 'lib/session';
import { GUN_PATH, GUN_KEY } from 'utils/constants';

if (!process.env.APP_ACCESS_KEY_PAIR) {
  throw new Error('APP_ACCESS_KEY_PAIR in env environments required');
}

const APP_ACCESS_KEY_PAIR = JSON.parse(process.env.APP_ACCESS_KEY_PAIR);
const INVITE_SECRET = process.env.INVITE_SECRET;

const certificatesHandler = async (
  req: NextIronRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  if (method === 'POST') {
    const { username, pub } = getUser(req);

    // See https://gun.eco/docs/SEA.certify for policies
    const policy = [
      // allow users to add and edit their profiles with:
      //   gun
      //     .get('~'+gunApp.pub)
      //     .get('profiles')
      //     .get(user.pub)
      //     .put({ name: 'alice' }, null, {opt: { cert: certificate }} )
      { '*': GUN_PATH.profiles },
      { '*': GUN_PATH.vouches },
      // TODO chat
    ];

    // expire in 2 hours
    const expiresAt = Date.now() + 60 * 60 * 1000 * 2;

    const certificate = await SEA.certify(
      [pub],
      policy,
      APP_ACCESS_KEY_PAIR,
      ({ err }: any) => {
        if (process.env.NODE_ENV === 'development') {
          if (err) {
            console.log(`Error creating certificate for %s:`, username, err);
          } else {
            console.log(`Successfully created certificate %s`, username);
          }
        }
      },
      // FIXME neither expiry or block seem to be working?
      // https://github.com/amark/gun/issues/1143
      {
        expiry: expiresAt,
        // name of path to blocked/banned users
        block: 'blocked',
      }
    );

    res.status(201).send({
      certificate,
      expires_at: expiresAt,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default certificatesHandler;
