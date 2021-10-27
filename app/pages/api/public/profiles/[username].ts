import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { managementClient } from 'lib/managementClient';
import type { UserMedia } from 'utils/media';
import { usersToPublicProfiles } from 'utils/profiles';
import { publicUsersQuery } from 'utils/query';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;
  const username = query.username;

  if (method === 'GET') {
    try {
      const users = await managementClient.getUsers({
        q: [
          ...publicUsersQuery,
          // exact match by username
          `username:"${username}"`,
        ].join(' AND '),
        search_engine: 'v3',
      });

      const user = users[0];

      if (user) {
        // Get user media
        const userMedia = {
          profilePhoto: {},
          profileMedia: {},
        };

        try {
          const { data: profilePhotoData } = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/media/profile-photos?username=${username}`
          );
          const { data: mediaData } = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/media/${username}`
          );

          userMedia.profilePhoto = profilePhotoData;
          userMedia.profileMedia = mediaData.files;
        } catch (e) {
          // some users may not have profile photos yet, pass through
          console.log(e);
        }

        // TODO
        const profiles: any[] = [];

        // const profiles = usersToPublicProfiles(users, {
        //   [user.username!]: userMedia,
        // });

        res.status(200).json(profiles[0]);
      } else {
        res.status(404).json({ statusCode: 404, message: 'User not found' });
      }
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
