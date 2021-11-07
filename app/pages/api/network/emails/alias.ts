import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { withAuthApiUser, getUser } from 'lib/auth';

const API_URL = `https://api.forwardemail.net/v1/domains/${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}/aliases`;

interface EmailAlias {
  sourceEmail: string;
  destinationEmail: string;
}

const getEmailAlias = async ({ username }: { username: string }) => {
  const { data } = await axios.get(`${API_URL}/${username}`, {
    auth: {
      username: process.env.FORWARD_EMAIL_API_KEY!,
      password: '',
    },
  });

  return { data };
};

const createEmailAlias = async ({
  username,
  destinationEmail,
}: {
  username: string;
  destinationEmail: string;
}) =>
  axios.post(
    API_URL,
    {
      name: username,
      recipients: destinationEmail,
      is_enabled: true,
    },
    {
      auth: {
        username: process.env.FORWARD_EMAIL_API_KEY!,
        password: '',
      },
    }
  );

const updateEmailAlias = async ({
  aliasId,
  destinationEmail,
}: {
  aliasId: string;
  destinationEmail: string;
}) =>
  axios.put(
    `${API_URL}/${aliasId}`,
    {
      recipients: destinationEmail,
      is_enabled: true,
    },
    {
      auth: {
        username: process.env.FORWARD_EMAIL_API_KEY!,
        password: '',
      },
    }
  );

const emailAliasHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body, query } = req;
  const { email } = getUser(req)!;
  const username = body.username;

  if (!username) {
    res.status(400).json({
      statusCode: 400,
      message: 'Bad Request',
    });

    return;
  }

  switch (method) {
    case 'POST': {
      try {
        const { data } = await createEmailAlias({
          username,
          destinationEmail: email,
        });

        const respData: EmailAlias = {
          sourceEmail: `${username}@${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}`,
          destinationEmail: data.recipients[0],
        };

        res.status(201).send(respData);
      } catch (err: any) {
        console.debug(err.message);

        res
          .status(500)
          .json({ statusCode: 500, message: 'Internal Server Error' });
      }
      break;
    }
    case 'PUT': {
      const { destinationEmail, createOnNotFound } = body;

      try {
        const { data } = await getEmailAlias({ username });

        if (createOnNotFound && !data) {
          await createEmailAlias({
            username,
            destinationEmail,
          });
        } else {
          await updateEmailAlias({
            aliasId: data.id,
            destinationEmail,
          });
        }

        const respData: EmailAlias = {
          sourceEmail: `${username}@${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}`,
          destinationEmail,
        };

        res.status(201).send({
          sourceEmail: `${username}@${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}`,
          destinationEmail,
        });
      } catch (err: any) {
        console.debug(err.message);

        res
          .status(500)
          .json({ statusCode: 500, message: 'Internal Server Error' });
      }

      break;
    }
    default:
      res.setHeader('Allow', ['POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default withAuthApiUser(emailAliasHandler);
