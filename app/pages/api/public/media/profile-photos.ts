import { NextApiRequest, NextApiResponse } from 'next';
import B2 from 'backblaze-b2';

import { Media, USER_UPLOAD_PREFIX, PROFILE_PHOTOS_PREFIX } from 'utils/media';

const profilePhotosHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
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
        prefix: `${userUploadDirPrefix}/${USER_UPLOAD_PREFIX}${PROFILE_PHOTOS_PREFIX}${
          username ? `${username}.` : ''
        }`,
      });

      let respData: { files?: Media[] } | Media;

      if (username) {
        const file = data.files[0];

        respData = {
          id: file.fileId,
          url: `${downloadURL}/file/${bucketName}/${file.fileName}`,
          fileName: file.fileName,
          timestamp: file.uploadTimestamp,
        };
      } else {
        const files: Media[] = [];

        data.files.forEach(({ fileId, uploadTimestamp, fileName }: any) => {
          const username = fileName.slice(
            fileName.indexOf(`${USER_UPLOAD_PREFIX}${PROFILE_PHOTOS_PREFIX}`) +
              `${USER_UPLOAD_PREFIX}${PROFILE_PHOTOS_PREFIX}`.length,
            fileName.lastIndexOf('.')
          );

          files.push({
            id: fileId,
            fileName: fileName.slice(fileName.lastIndexOf('/') + 1),
            timestamp: uploadTimestamp,
            url: `${downloadURL}/file/${bucketName}/${fileName}`,
          });
        });

        respData = {
          files: files,
        };
      }

      res.status(200).json(respData);
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

export default profilePhotosHandler;
