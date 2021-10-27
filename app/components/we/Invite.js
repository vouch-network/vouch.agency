import axios from 'axios';
import { useState } from 'react';
import { Box, Button, Text, Layer } from 'grommet';
import { format } from 'fecha';

import useUser from 'components/useUser';

const EXPIRATION_HOURS = 48;

export default function InviteForm() {
  const { userSettings } = useUser();
  const [isOpen, setIsOpen] = useState();
  const [inviteExpiresAt, setInviteExpiresAt] = useState();
  const [inviteMessage, setInviteMessage] = useState();
  const [isInviteCopied, setIsInviteCopied] = useState();

  const copyInvite = async () => {
    await window.navigator.clipboard.writeText(inviteMessage);

    setIsInviteCopied(true);
  };

  const generateInvite = async () => {
    const expiresAt = Date.now() + 60 * 60 * 1000 * EXPIRATION_HOURS;

    setInviteExpiresAt(expiresAt);

    const { data } = await axios.get(
      `/api/private/invites/generate?expiresAt=${expiresAt}`
    );

    setInviteMessage(
      [
        `Sign up for Vouch Network at this link:`,
        `${data.invite_url}\n`,
        `  You are invited by ${userSettings.username}@vouch.agency`,
        `  Your passcode is ${data.passcode.slice(0, 3)}-${data.passcode.slice(
          3
        )}`,
        `\nThis invite expires in ${EXPIRATION_HOURS} hrs (${format(
          data.expiresAt,
          'MM/DD, hh:mm A'
        )})`,
      ].join('\n')
    );

    // TODO save invite hash in gundb so that we can revoke it

    setIsOpen(true);
  };

  const onClose = () => {
    setInviteMessage();
    setIsInviteCopied();
    setIsOpen(false);
  };

  return (
    <>
      <Box align="center">
        <Button onClick={generateInvite} label="Generate invite" primary />
      </Box>

      {isOpen && (
        <Layer onClickOutside={onClose} onEsc={onClose}>
          <Box background="white" pad="medium" round="xsmall" width="30em">
            <Text margin={{ bottom: 'small' }}>
              This invite will expire in {EXPIRATION_HOURS / 24} days (
              {format(inviteExpiresAt, 'dddd [at] ha')})
            </Text>
            <Text margin={{ bottom: 'small' }}>
              {isInviteCopied
                ? 'Copied. Text or private message this to the person you want to invite.'
                : 'Tap to copy'}
            </Text>

            <Box
              as="code"
              background="accent-3"
              pad={{ vertical: 'xsmall', horizontal: 'small' }}
              round="xsmall"
              overflow="auto"
              style={{
                whiteSpace: 'pre-line',
                wordWrap: 'break-word',
                fontSize: '.9em',
              }}
              onClick={copyInvite}
            >
              {inviteMessage}
            </Box>
          </Box>
        </Layer>
      )}
    </>
  );
}
