import axios from 'axios';
import { Box, Button, Text, Anchor } from 'grommet';
import styled from 'styled-components';

import { withGunAuthGate } from 'components/GunAuthGate';
import useUser from 'components/useUser';
import NetworkLayout from 'components/NetworkLayout';
import LoggedInLayout from 'components/LoggedInLayout';

const Wrapper = styled(Box)`
  p {
    line-height: 1.5;
    max-width: 38em;
  }
`;

export default function HowTo() {
  const { userProfile } = useUser();

  return (
    <Wrapper width="large" margin={{ vertical: 'xlarge' }}>
      <Box as="header">
        <Text as="h1" size="xxlarge">
          How to operate Vouch Agency
        </Text>
        <Text as="p" size="large" color="neutral-1">
          Vouch Agency is run by members of the network. <br />
          Here's a short guide of what <strong>you can do</strong>.
        </Text>
      </Box>

      <Box id="profile-info" as="section">
        <Text as="h2">Update your public profile</Text>
        <Text as="p">
          You can change your name, profile photo, and all other information
          shown on your public profile from this app. You can upload up to X
          photos to your profile. (
          <em>
            Video and audio uploads not supported at this time, but you can vote
            to enable them as a new feature.
          </em>
          )
        </Text>
      </Box>

      <Box id="profile-visibility" as="section">
        <Text as="h2">Control your profile visibility</Text>
        <Text as="p">
          Hide your profile from the public directory (
          <Anchor
            size="small"
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/profiles}`}
          >
            {process.env.NEXT_PUBLIC_BASE_URL}/profiles
          </Anchor>
          ) by clicking{' '}
          <Button
            size="small"
            label="Disable public profile"
            onClick={() => {}}
          />{' '}
          on your profile page.
        </Text>
        <Text as="p">
          Make your profile publicaly visible again by clicking{' '}
          <Button
            size="small"
            label="Enable public profile"
            onClick={() => {}}
          />
          .
        </Text>
        <Text as="p">
          Disabling your profile won't delete any of your information or
          uploaded media, and you can continue to edit your profile even if it's
          hidden from the public. However, some interactions may be disabled.
          This ensures everyone who is participating in the network is highly
          visible.
        </Text>
      </Box>

      <Box id="chat" as="section">
        <Text as="h2">Chat with other people in the network</Text>
        <Text as="p">
          The chat room is ephemeral--it only works if one or more person is in
          the chat room, and only saves the last message sent, for reference.
          Use it whenever you want to chat about something with people who are
          online. (
          <em>
            Coming soon: notifications, and a way to pin important messages,
            like suggestions.
          </em>
          )
        </Text>
      </Box>

      <Box margin={{ top: 'large', bottom: 'small' }}>
        <Text as="p" size="large" color="accent-2">
          However, there are <strong>some limitations</strong> to what you can
          do due to tech constraints.
        </Text>
      </Box>

      <Box id="media-limits" as="section">
        <Text as="h2">You can't upload too many photos (yet)</Text>
        <Text as="p">
          This is to keep costs down. Right now, all photos are uploaded into a
          central hosting service called Blazeback which offers a free tier.
          Unless/until we figure out how to get some cash, we need to use as
          much free stuff as possible.
        </Text>
      </Box>

      <Box id="admin-help" as="section">
        <Text as="h2">
          You can't change your email address without an admin.
        </Text>
        <Text as="p">
          User authentication (e.g. signing in, sign ups) are currently handled
          by a service called <Anchor href="https://auth0.com/">Auth0</Anchor>.
          sua owns this account. They are actively looking for ways to
          decentralize user authentication so that log ins are not managed by
          one person (i.e. sua.)
        </Text>
        <Text as="p">
          Text or email sua if you need to change your email address (remember,
          your email address is only used to log in, and is not visible to
          anyone else.)
        </Text>
        <Text as="p">
          If you need to change your password, log out and try to log back in.
          Instead of signing in, click "Forgot password."
        </Text>
        <Text as="p">
          Your username cannot be changed because it's your unique identifier.
          You'll need to request a new account to change your username, which
          sua can help with.
        </Text>
      </Box>
    </Wrapper>
  );
}

export const getServerSideProps = withGunAuthGate();

HowTo.getLayout = function getLayout(page) {
  return <NetworkLayout>{page}</NetworkLayout>;
};
