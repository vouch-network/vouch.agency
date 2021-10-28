import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  Box,
  Button,
  Form,
  FormField,
  Grid,
  Text,
  FileInput,
  Image,
  ThemeContext,
} from 'grommet';
import { format } from 'fecha';

import { withGunAuthGate } from 'components/GunAuthGate';
import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';
import UserLayout from 'components/UserLayout';
import { MB_BYTES, MAX_FILE_SIZE } from 'utils/media';

const MEDIA_MAX = 4;

function FilePreview({ file, isFileValid }) {
  const [base64, setBase64] = useState();
  const fileReader = new FileReader();

  if (isFileValid) {
    fileReader.readAsDataURL(file);
    fileReader.addEventListener('load', () => {
      setBase64(fileReader.result);
    });
  }

  return (
    <Box direction="row" align="center" gap="small">
      {isFileValid && (
        <Box background="light-2" height="xxsmall" width="xxsmall">
          {base64 && <Image src={base64} fit="contain" />}
        </Box>
      )}
      <Text color={isFileValid ? 'black' : 'status-disabled'}>{file.name}</Text>
    </Box>
  );
}

export default function UserMedia() {
  const { userProfile, setUserProfile } = useUser();
  // FIXME can't seem to reset file input, so just rerender it...
  const [showUploadInput, setShowUploadInput] = useState();
  const [isUploading, setIsUploading] = useState();
  const [files, setFiles] = useState([]);

  // TODO replace
  const profileMedia = [];

  const handleChange = (e, { files }) => {
    const validFiles = files
      .slice(0, MEDIA_MAX)
      .filter((file) => file.size <= MAX_FILE_SIZE);

    setFiles(validFiles);
  };

  const handleSubmit = async () => {
    setIsUploading(true);

    try {
      // TODO one request
      const dataArr = await Promise.all(
        files.map((file) =>
          axios
            .post(`/api/network/media/upload`, file, {
              headers: {
                'content-type': file.type,
                // prefix with current time to prevent b2
                // from overwriting files with the same name
                'x-filename': `${Date.now()}_${file.name}`,
              },
            })
            .then(({ data }) => data)
        )
      );

      setUserProfile({
        ...userProfile,
        media: {
          ...userProfile.media,
          // profileMedia: [...dataArr, ...profileMedia],
        },
      });
    } catch (err) {
      console.error(err);
      // TODO handle error
    }

    setIsUploading(false);
    setFiles([]);
    setShowUploadInput(false);
  };

  const removeMedia = async (media) => {
    try {
      const { data } = await axios.delete(
        `/api/network/media/${media.id}?fileName=${encodeURIComponent(
          media.fileName
        )}`
      );

      setUserProfile({
        ...userProfile,
        media: {
          ...userProfile.media,
          // profileMedia: profileMedia.filter((d) => d.id !== data.id),
        },
      });
    } catch (err) {
      console.error(err);
      // TODO handle error
    }
  };

  return (
    <Box pad={{ horizontal: 'medium' }} gap="medium">
      {!showUploadInput && (
        <Box pad="medium" gap="medium" align="center">
          <Text>Delete photos to upload new ones.</Text>

          <Button
            label="Add more photos"
            onClick={() => setShowUploadInput(true)}
            disabled={profileMedia.length >= MEDIA_MAX}
          />
        </Box>
      )}
      {profileMedia.length < MEDIA_MAX && showUploadInput && (
        <Box pad="medium" gap="medium">
          <Box>
            <Text as="h3" margin="none">
              Add more photos
            </Text>
            <Text as="p" margin={{ bottom: 'none' }} size="small">
              You can add up to {MEDIA_MAX} photos each under{' '}
              {(MAX_FILE_SIZE / MB_BYTES).toFixed(0)} MB on your profile, in
              addition to your main profile photo.{' '}
              <Link href="/network/how-to#media-limits">Learn more</Link>
            </Text>
          </Box>
          <Box>preview</Box>
          <Box>
            <ThemeContext.Extend
              value={{
                fileInput: {
                  pad: {
                    horizontal: 'medium',
                    vertical: 'medium',
                  },
                  round: 'small',
                  background: 'light-1',
                },
              }}
            >
              <FileInput
                onChange={handleChange}
                accept="image/png, image/jpeg"
                maxSize={MAX_FILE_SIZE}
                multiple={{
                  max: MEDIA_MAX - profileMedia.length,
                }}
                renderFile={(file) => (
                  <FilePreview file={file} isFileValid={files.includes(file)} />
                )}
              />
            </ThemeContext.Extend>
          </Box>
          <Box align="center">
            <Button
              label={`Upload ${files.length} photo${
                files.length > 1 ? 's' : ''
              }`}
              primary
              onClick={handleSubmit}
              disabled={isUploading || !files.length}
            />
          </Box>
        </Box>
      )}
      <Text as="h3" margin="none">
        Uploaded photos
      </Text>
      <Box>
        {!profileMedia.length && <Text color="status-unknown">None yet.</Text>}

        <Grid columns="medium" gap="small">
          {profileMedia.map((media) => (
            <Box
              as="figure"
              key={media.url}
              margin="none"
              gap="xsmall"
              style={{ position: 'relative' }}
            >
              <Box background="light-1" height="medium">
                <Image src={media.url} fit="contain" />
              </Box>
              <Box as="figcaption" margin="none">
                <Text size="xsmall">
                  {/* TODO move somewhere common, remove prefix from filename */}
                  {media.fileName.split('_').slice(2).join('_')}
                </Text>
                <Text size="xsmall">
                  uploaded on{' '}
                  {format(media.timestamp, 'MM-DD-YYYY [at] hh:mm A')}
                </Text>
              </Box>
              <Box
                pad="xsmall"
                style={{ position: 'absolute', top: 0, right: 0 }}
              >
                <Button
                  size="small"
                  label="delete"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${
                          media.fileName
                        }, uploaded on ${format(
                          media.timestamp,
                          'MM-DD-YYYY [at] hh:mm A'
                        )}?`
                      )
                    ) {
                      removeMedia(media);
                    }
                  }}
                />
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

export const getServerSideProps = withGunAuthGate();

UserMedia.getLayout = function getLayout(page) {
  return (
    <NetworkLayout>
      <LoggedInLayout>
        <UserLayout>{page}</UserLayout>
      </LoggedInLayout>
    </NetworkLayout>
  );
};
