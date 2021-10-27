import type { Session } from 'next-iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';

import { withSession, NextIronRequest, getUser } from 'lib/session';

async function login(req: NextIronRequest, res: NextApiResponse) {
  const { body, method } = req;

  if (method === 'POST') {
    const user = {
      username: body.username,
      pub: body.pub,
    };
    req.session.set('user', user);

    await req.session.save();

    res.status(200).send(user);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function logout(req: NextIronRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    req.session.destroy();

    res.status(200).send({});
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function user(req: NextIronRequest, res: NextApiResponse) {
  const { query, method } = req;

  if (method === 'GET') {
    const user = getUser(req);

    res.status(200).send({
      user: {
        username: user.username,
        pub: user.sea.pub,
      },
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

function sessionHandler(req: NextIronRequest, res: NextApiResponse) {
  let {
    query: { session: route },
  } = req;

  route = Array.isArray(route) ? route[0] : route;

  switch (route) {
    case 'login':
      return login(req, res);
    case 'logout':
      return logout(req, res);
    case 'user':
      return user(req, res);
    default:
      res.status(404).end();
  }
}

export default withSession(sessionHandler);
