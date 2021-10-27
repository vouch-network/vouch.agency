import { withIronSession } from 'next-iron-session';
import type { Session } from 'next-iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';

export type NextIronRequest = NextApiRequest & { session: Session };

export function getUser(req: NextIronRequest) {
  return req.session.get('user');
}

export default function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SESSION_COOKIE_SECRET!,
    cookieName: process.env.SESSION_COOKIE_NAME!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });
}
