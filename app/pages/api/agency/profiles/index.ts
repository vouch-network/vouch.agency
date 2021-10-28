import { NextApiRequest, NextApiResponse } from 'next';

import { managementClient } from 'lib/managementClient';
import { usersToPublicProfiles } from 'utils/profiles';
import { publicUsersQuery } from 'utils/query';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      const users = await managementClient.getUsers({
        q: [...publicUsersQuery].join(' AND '),
        search_engine: 'v3',
      });

      const profiles = usersToPublicProfiles(users);

      res.status(200).json(profiles);
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ statusCode: 500, message: 'Something unexpected went wrong' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
