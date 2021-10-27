import axios from 'axios';
import { useState } from 'react';
import { Box, Button, Text, FileInput, Image, Layer } from 'grommet';

import ButtonSpinner from 'components/ButtonSpinner';
import {
  USER_UPLOAD_PREFIX,
  PROFILE_PHOTOS_PREFIX,
  MB_BYTES,
  MAX_FILE_SIZE,
} from 'utils/media';

const SIZE_PX = 300;

export default function ProfilePhotoUpload({ userProfile, saveUserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState();
  const [previewFile, setPreviewFile] = useState();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleChange = (e, { files }) => {
    const file = files[files.length - 1];

    if (file) {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);
      fileReader.addEventListener('load', () => {
        setPreviewFile({
          file,
          base64: fileReader.result,
        });
      });
    } else {
      setPreviewFile(null);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);

    const { file } = previewFile;

    const fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
    const fileName = `${USER_UPLOAD_PREFIX}${PROFILE_PHOTOS_PREFIX}${username}.${fileType}`;

    try {
      console.log('ready:', file.type);

      const { data } = await axios.post(`/api/private/media/upload`, file, {
        headers: {
          'content-type': file.type,
          // TODO maybe a better way to pass file name?
          'x-filename': fileName,
        },
        onUploadProgress: (event) => {
          // TODO fix and show progress
          console.log(
            `Current progress:`,
            Math.round((event.loaded * 100) / event.total)
          );
        },
      });

      setUserProfile({
        ...userProfile,
        media: {
          ...userProfile.media,
          profilePhoto: data,
        },
      });
    } catch (err) {
      console.error(err);
      // TODO handle error
    }

    setIsUploading(false);
    closeModal();
    setPreviewFile();
  };

  const profilePhotoUrl = userProfile.media?.profilePhoto?.url;

  return (
    <Box gap="xsmall" align="center">
      {!profilePhotoUrl && (
        <Box
          width={`${SIZE_PX}px`}
          height={`${SIZE_PX}px`}
          background="light-1"
          align="center"
          justify="center"
        >
          <Button onClick={openModal} label="Add photo" color="accent-1" />
        </Box>
      )}

      {profilePhotoUrl && (
        <Box
          width={`${SIZE_PX}px`}
          height={`${SIZE_PX}px`}
          background="light-1"
        >
          <Image src={profilePhotoUrl} fit="contain" />
        </Box>
      )}

      {profilePhotoUrl && <Button onClick={openModal} label="Change photo" />}

      {isOpen && (
        <Layer
          id="ProfilePhotoUpload-modal"
          position="center"
          onClickOutside={closeModal}
          onEsc={closeModal}
        >
          <Box pad="medium" gap="small">
            <Text as="h3" margin="none">
              Change your profile photo
            </Text>
            <Box
              width={`${SIZE_PX}px`}
              height={`${SIZE_PX}px`}
              background="light-1"
            >
              {(previewFile || profilePhotoUrl) && (
                <Image
                  src={previewFile ? previewFile.base64 : profilePhotoUrl}
                  fit="contain"
                />
              )}
            </Box>

            <Box width="16em">
              <FileInput
                onChange={handleChange}
                maxSize={MAX_FILE_SIZE}
                accept="image/png, image/jpeg"
              />

              <Box margin={{ top: 'small' }}>
                <Text size="xsmall">
                  Max file size {(MAX_FILE_SIZE / MB_BYTES).toFixed(1)} MB
                </Text>
              </Box>
            </Box>

            <Box margin={{ top: 'small' }} align="center">
              <Button
                onClick={handleSubmit}
                label={isUploading ? <ButtonSpinner /> : 'Upload photo'}
                disabled={!previewFile || isUploading}
                primary
              />
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  );
}
