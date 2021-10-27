import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';
import B2 from 'backblaze-b2';

import type { Media } from 'utils/media';
import { USER_UPLOAD_PREFIX, PROFILE_PHOTOS_PREFIX } from 'utils/media';

const userMediaHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, body, method } = req;

  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Session not found');
  }

  const id = session.user.sub;
  const accessToken = session.accessToken;
  let user;

  // Get current user info
  try {
    const currentUserManagementClient = new ManagementClient({
      token: accessToken,
      domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
      scope: process.env.AUTH0_SCOPE,
    });

    user = await currentUserManagementClient.getUser({
      id: id as string,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ statusCode: 500, message: err.message });
  }

  if (!user) {
    res.status(404).json({ statusCode: 404, message: 'User not found' });

    return;
  }

  if (method === 'DELETE') {
    const b2 = new B2({
      applicationKeyId: process.env.BACKBLAZE_KEY_ID,
      applicationKey: process.env.BACKBLAZE_APP_KEY,
    });

    // TODO authorization lasts 24 hrs, can it be shorter?
    await b2.authorize();

    const { data } = await b2.deleteFileVersion({
      fileId: query.fileId,
      fileName: `${process.env.BLAZEBACK_UPLOAD_FILE_DIRECTORY!.replace(
        /^\/|\/$/g,
        ''
      )}/media/profiles/${user.username}/${query.fileName}`,
    });

    res.status(200).json({
      id: data.fileId,
    });
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuthRequired(userMediaHandler);
