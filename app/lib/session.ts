import { withIronSession } from 'next-iron-session';
import type { Session } from 'next-iron-session';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export type NextIronRequest = NextApiRequest & { session: Session };

export type NextIronApiHandler<T = any> = (
  req: NextIronRequest,
  res: NextApiResponse<T>
) => void | Promise<void>;

export function getUser(req: NextIronRequest) {
  return req.session?.get('user');
}

export function withUserServerSideProps(initialProps: any) {
  return async function getServerSideProps(context: any) {
    const user = getUser(context.req) || null;

    return {
      props: {
        ...initialProps,
        user,
      },
    };
  };
}

export function withSession(
  handler: NextApiHandler | NextIronApiHandler
): NextIronApiHandler {
  return withIronSession(handler, {
    password: process.env.SESSION_COOKIE_SECRET!,
    cookieName: process.env.SESSION_COOKIE_NAME!,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });
}

export default function withSessionRequired(
  handler: NextApiHandler | NextIronApiHandler
): NextIronApiHandler {
  return withSession(
    async (req: NextIronRequest, res: NextApiResponse): Promise<void> => {
      const user = getUser(req);

      if (!user) {
        res.status(401).json({
          error: 'not_authenticated',
          description:
            'The user does not have an active session or is not authenticated',
        });

        return;
      }

      await handler(req, res);
    }
  );
}
