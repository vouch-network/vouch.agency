import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import withSessionRequired, { getUser, NextIronRequest } from 'lib/session';

const API_URL = `https://api.forwardemail.net/v1/domains/${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}/aliases`;

interface EmailAlias {
  sourceEmail: string;
  destinationEmail: string;
}

const getEmailAlias = async ({ username }: { username: string }) => {
  const { data } = await axios.get(`${API_URL}?name=${username}`, {
    auth: {
      username: process.env.FORWARD_EMAIL_API_KEY!,
      password: '',
    },
  });

  return { data: data[0] };
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

const emailAliasHandler = async (
  req: NextIronRequest,
  res: NextApiResponse
) => {
  const { method, body } = req;
  const { username } = getUser(req);

  switch (method) {
    case 'GET': {
      try {
        const { data } = await getEmailAlias({ username });

        if (data) {
          const respData: EmailAlias = {
            sourceEmail: `${username}@${process.env.GANDI_DOMAIN_NAME}`,
            destinationEmail: data.recipients[0],
          };

          res.status(200).send(respData);
        } else {
          res.status(404).send({});
        }
      } catch (err: any) {
        console.debug(err.message);

        res
          .status(500)
          .json({ statusCode: 500, message: 'Internal Server Error' });
      }

      break;
    }
    case 'POST': {
      const { destinationEmail } = body;

      try {
        const { data } = await createEmailAlias({
          username,
          destinationEmail,
        });

        const respData: EmailAlias = {
          sourceEmail: `${username}@${process.env.GANDI_DOMAIN_NAME}`,
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

      const { data } = await getEmailAlias({ username });

      try {
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
          sourceEmail: `${username}@${process.env.GANDI_DOMAIN_NAME}`,
          destinationEmail,
        };

        res.status(201).send({
          sourceEmail: `${username}@${process.env.GANDI_DOMAIN_NAME}`,
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

export default withSessionRequired(emailAliasHandler);
