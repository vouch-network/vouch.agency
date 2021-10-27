import { NextApiRequest, NextApiResponse } from 'next';
import B2 from 'backblaze-b2';

import { Media, USER_UPLOAD_PREFIX, PROFILE_PHOTOS_PREFIX } from 'utils/media';

const userMediaHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;

  if (method === 'GET') {
    const username = query.username;

    try {
      const b2 = new B2({
        applicationKeyId: process.env.BACKBLAZE_KEY_ID,
        applicationKey: process.env.BACKBLAZE_APP_KEY,
      });

      // TODO authorization lasts 24 hrs, can it be shorter?
      // Construct friendly URL from data returned by auth
      const { data: authRespData } = await b2.authorize();
      const bucketName = authRespData.allowed.bucketName;
      const downloadURL = authRespData.downloadUrl;

      const userUploadDirPrefix = `${process.env.BLAZEBACK_UPLOAD_FILE_DIRECTORY!.replace(
        /^\/|\/$/g,
        ''
      )}/media/profiles`;

      const { data } = await b2.listFileNames({
        bucketId: process.env.BACKBLAZE_BUCKET_ID,
        delimiter: '/',
        prefix: `${userUploadDirPrefix}/${username}/${USER_UPLOAD_PREFIX}`,
      });

      const resData: { files: Media[] } = {
        files: data.files.map((d: any) => ({
          id: d.fileId,
          url: `${downloadURL}/file/${bucketName}/${d.fileName}`,
          fileName: d.fileName.slice(d.fileName.lastIndexOf('/') + 1),
          timestamp: d.uploadTimestamp,
        })),
      };

      res.status(200).json(resData);
    } catch (err: any) {
      console.log(err);
      res.status(500).json({
        statusCode: 500,
        message: 'Something unexpected went wrong',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default userMediaHandler;
