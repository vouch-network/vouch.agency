import { useRef, useEffect, useState } from 'react';
import { Grid, Box, Button, Text, Anchor, Image, TextInput } from 'grommet';
import { format } from 'fecha';

import useUser from 'components/useUser';
import useGun from 'components/useGun';
import Chat from 'components/we/Chat';
import Invite from 'components/we/Invite';

const NEXT_PUBLIC_GUN_APP_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_GUN_APP_PUBLIC_KEY;
const MAX_MESSAGES = 50;

function NewPeople() {
  const { getGun, getUser, getCertificate, isAuthenticated } = useGun();
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      getGun()
        .get(`~${NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
        .get('profiles')
        .map()
        // TODO updates
        .once((profile, pub) => {
          setProfiles((p) => ({
            ...p,
            [pub]: profile,
          }));
        });
    }
  }, [isAuthenticated]);

  return (
    <Box>
      people
      <ul>
        {Object.entries(profiles).map(
          ([key, profile]) =>
            profile && (
              <li key={key}>
                <div>{profile.displayName || profile.username}</div>
                <div>vouched by: {(profile.vouchedBy || {})['#']}</div>
              </li>
            )
        )}
      </ul>
    </Box>
  );
}

export default function Dashboard() {
  return (
    <Box pad={{ bottom: 'xlarge' }}>
      <Grid
        areas={[
          ['chat', 'chat', 'chat', 'pending'],
          ['chat', 'chat', 'chat', 'invite'],
          ['joined', 'joined', 'joined', 'joined'],
        ]}
        invite
        columns={['1fr', '1fr', '1fr', '1fr']}
        rows={
          // px offset is rough estimate of height of
          // header + height of invite box + some space
          [`calc(100vh - 360px)`, 'auto', 'auto']
        }
        gap="medium"
      >
        <Box gridArea="chat" background="black" round="small" pad="medium">
          <Chat />
        </Box>
        <Box gridArea="pending" background="light-2" round="small" pad="large">
          [pending]
        </Box>
        <Box gridArea="invite" background="black" round="small" pad="large">
          <Text
            as="p"
            weight="bold"
            margin={{ top: 'none' }}
            textAlign="center"
          >
            Invite someone to join
          </Text>
          <Invite />
        </Box>
        <Box gridArea="joined" background="light-2" round="small" pad="large">
          <NewPeople />
        </Box>
      </Grid>
    </Box>
  );
}
