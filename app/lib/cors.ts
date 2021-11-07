import NextCors from 'nextjs-cors';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const allowList = [process.env.NEXT_PUBLIC_BASE_URL];
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

export function withCors(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await NextCors(req, res, corsOptions);

      handler(req, res);
    } catch (err) {
      res.status(403).send({ statusCode: 403, message: 'Forbidden' });
    }
  };
}
