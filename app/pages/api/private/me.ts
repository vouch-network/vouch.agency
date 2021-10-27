import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';

import type { Media, UserMedia } from 'utils/media';
import { userToPrivateProfile } from 'utils/profiles';

type UserMetadataParams = {
  display_name?: string;
  location_str?: string;
  pronouns_str?: string;
  enable_public_profile?: string;
};

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;

  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Session not found');
  }

  const id = session.user.sub;
  const accessToken = session.accessToken;

  switch (method) {
    case 'GET':
      try {
        const currentUserManagementClient = new ManagementClient({
          token: accessToken,
          domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
          scope: process.env.AUTH0_SCOPE,
        });

        const user = await currentUserManagementClient.getUser({
          id: id as string,
        });

        // Get user media
        const userMedia = {
          profilePhoto: {},
          profileMedia: {},
        };

        try {
          const { data: profilePhotoData } = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/media/profile-photos?username=${user.username}`
          );
          const { data: mediaData } = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/media/${user.username}`
          );

          userMedia.profilePhoto = profilePhotoData;
          userMedia.profileMedia = mediaData.files;
        } catch (e) {
          // some users may not have profile photos yet, pass through
          console.log(e);
        }

        res.status(200).json(userToPrivateProfile(user, userMedia));
      } catch (err: any) {
        console.log(err);
        res.status(500).json({ statusCode: 500, message: err.message });
      }

      break;
    case 'PUT':
      try {
        const params: UserMetadataParams = body;

        // Don't allow saving empty user metadata
        if (
          Object.values(params).filter(
            (v) => typeof v !== 'undefined' && v !== null
          ).length === 0
        ) {
          res.status(400).json({
            statusCode: 400,
            message: 'Bad Request',
          });

          break;
        }

        const currentUserManagementClient = new ManagementClient({
          token: accessToken,
          domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
          scope: process.env.AUTH0_SCOPE,
        });

        const user = await currentUserManagementClient.updateUserMetadata(
          {
            id: id as string,
          },
          params
        );

        res.status(200).json(params);
      } catch (err: any) {
        console.log(err);
        res.status(500).json({ statusCode: 500, message: err.message });
      }

      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default withApiAuthRequired(userHandler);
