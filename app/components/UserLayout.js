import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Button, Text, Nav } from 'grommet';
import styled from 'styled-components';

import PostSignUpScreen from 'components/me/PostSignUpScreen';
import useUser from 'components/useUser';
import { colors } from 'utils/theme';

const Tab = styled(Box)`
  a {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    font-weight: normal;
    color: ${colors['brand']};
    transition: box-shadow 0.15s;
    box-shadow: ${(props) =>
      props.isActive ? `0 -3px 0 0 ${colors['brand']} inset` : 'none'};

    &:hover {
      text-decoration: none;
    }
  }
`;

export default function UserLayout({ children }) {
  const router = useRouter();
  const {
    user,
    userProfile,
    userSettings,
    saveUserSettings,
    saveUserProfile,
    toggleProfileVisibility,
    isSettingsReady,
    isProfileReady,
  } = useUser();

  if (!isProfileReady || !isSettingsReady) {
    return null;
  }

  if (
    (isProfileReady && !userProfile?.displayName) ||
    (isSettingsReady && !userSettings?.contactEmail)
  ) {
    return (
      <Box margin={{ top: 'xlarge' }}>
        <PostSignUpScreen
          userProfile={userProfile}
          userSettings={userSettings}
          onSetPrivateEmail={saveUserSettings}
          onSetDisplayName={saveUserProfile}
        />
      </Box>
    );
  }

  return (
    <Box width="900px" gap="small">
      <Text as="h1" size="xlarge">
        You
      </Text>

      {/* <Box
        pad="small"
        background={userProfile.isListed ? 'accent-1' : 'black'}
        round="xsmall"
      >
        {!userProfile.isListed && (
          <Text as="p" margin="none">
            Your profile is currently <strong>hidden</strong> from the world.{' '}
            <Link href="/network/how-to#profile-visibility">Learn more</Link>
            <Button
              size="small"
              label="Enable public profile"
              margin={{ left: 'small' }}
              primary
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to show your profile to the world?'
                  )
                ) {
                  toggleProfileVisibility(true);
                }
              }}
            />
          </Text>
        )}

        {userProfile.isListed && (
          <Text as="p" margin="none">
            Your profile is currently visible to the world{' '}
            <Link href={`/profiles/${userSettings.username}`}>here</Link>.{' '}
            <span style={{ textDecoration: 'underline' }}>
              <Link href="/network/how-to#profile-visibility">Learn more</Link>
            </span>
            <Button
              size="small"
              label="Disable public profile"
              margin={{ left: 'small' }}
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to hide your profile from the world?'
                  )
                ) {
                  toggleProfileVisibility(false);
                }
              }}
            />
          </Text>
        )}
      </Box> */}

      <Box>
        <Nav
          direction="row"
          gap="large"
          border={[
            {
              side: 'bottom',
              color: 'light-2',
              size: 'small',
              style: 'solid',
            },
          ]}
          margin={{ top: 'medium', bottom: 'medium' }}
        >
          <Tab isActive={router.pathname === '/network/me'}>
            <Link href="/network/me">Public profile</Link>
          </Tab>
          <Tab isActive={router.pathname === '/network/me/vouches'}>
            <Link href="/network/me/vouches">Vouches</Link>
          </Tab>
          {/* <Tab isActive={router.pathname === '/network/me/media'}>
            <Link href="/network/me/media">Profile photos</Link>
          </Tab> */}
          <Tab isActive={router.pathname === '/network/me/account'}>
            <Link href="/network/me/account">Account settings</Link>
          </Tab>
        </Nav>

        <Box
          border={[
            {
              side: 'all',
              color: 'light-2',
              size: 'small',
              style: 'solid',
            },
          ]}
          round="small"
          pad="medium"
          margin={{ bottom: 'large' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
