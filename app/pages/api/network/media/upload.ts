import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';
import B2 from 'backblaze-b2';

import type { Media } from 'utils/media';
import { USER_UPLOAD_PREFIX, PROFILE_PHOTOS_PREFIX } from 'utils/media';

const userMediaUploadHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;

  // reconstruct file buffer from stream
  const file = await new Promise((resolve) => {
    const chunks: any[] = [];

    req.on('readable', () => {
      let chunk;

      while (null !== (chunk = req.read())) {
        chunks.push(chunk);
      }
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

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

  if (method === 'POST') {
    const reqFileName = req.headers['x-filename'] as string;

    if (!reqFileName) {
      // TODO get file name from stream?
      res.status(400).json({
        statusCode: 400,
        message: 'Bad Request',
      });

      return;
    }

    const b2 = new B2({
      applicationKeyId: process.env.BACKBLAZE_KEY_ID,
      applicationKey: process.env.BACKBLAZE_APP_KEY,
    });

    // TODO authorization lasts 24 hrs, can it be shorter?
    // Construct friendly URL from data returned by auth
    const { data: authRespData } = await b2.authorize();
    const bucketName = authRespData.allowed.bucketName;
    const downloadURL = authRespData.downloadUrl;

    const { data: uploadData } = await b2.getUploadUrl({
      bucketId: process.env.BACKBLAZE_BUCKET_ID,
    });

    const userUploadDirPrefix = `${process.env.BLAZEBACK_UPLOAD_FILE_DIRECTORY!.replace(
      /^\/|\/$/g,
      ''
    )}/media/profiles`;
    let fileName = `${userUploadDirPrefix}/${user.username}/${USER_UPLOAD_PREFIX}${reqFileName}`;

    // TODO cleaner way of handling profile photo uploads
    // to different directory
    if (
      reqFileName.startsWith(
        `${USER_UPLOAD_PREFIX}${PROFILE_PHOTOS_PREFIX}${user.username}.`
      )
    ) {
      fileName = `${userUploadDirPrefix}/${reqFileName}`;
    }

    const { data } = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      data: file,
      fileName,
      // info: {},
    });

    const respData: Media = {
      id: data.fileId,
      url: `${downloadURL}/file/${bucketName}/${data.fileName}`,
      timestamp: data.uploadTimestamp,
      fileName: data.fileName.slice(data.fileName.lastIndexOf('/') + 1),
    };

    res.status(200).json(respData);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuthRequired(userMediaUploadHandler);

// disable body parsing and consume as a stream
export const config = {
  api: {
    bodyParser: false,
  },
};
