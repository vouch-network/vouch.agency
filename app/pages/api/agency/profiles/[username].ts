import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const API_URL = `https://api.forwardemail.net/v1/domains/${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}/aliases`;

const getEmailAlias = async ({ username }: { username: string }) => {
  const { data } = await axios.get(`${API_URL}/${username}`, {
    auth: {
      username: process.env.FORWARD_EMAIL_API_KEY!,
      password: '',
    },
  });

  return { data };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;
  const username = query.username as string;

  if (method === 'GET') {
    try {
      const { data } = await getEmailAlias({ username });

      res.status(200).json({
        profile: {
          email: `${data.name}@${data.domain.name}`,
        },
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        res.status(200).json({
          profile: null,
        });
      } else {
        console.log(err);
        res.status(500).json({
          statusCode: 500,
          message: 'Something unexpected went wrong',
        });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
