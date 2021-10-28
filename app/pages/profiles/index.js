import axios from 'axios';
import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useState } from 'react';
import { Box, Paragraph, Heading, Text, Image } from 'grommet';

import useGun from 'components/useGun';
import PublicLayout from 'components/PublicLayout';
import PublicNav from 'components/PublicNav';
import Square from 'components/Square';
import VouchText from 'components/VouchText';
import vouchLogo from 'public/images/vouch-logo.svg';
import { GUN_PATH, GUN_KEY, GUN_VALUE } from 'utils/constants';
import { expandDataKeys } from 'utils/gunDB';

const logoRatio = 20 / 100;

export default function Profiles({ aliases }) {
  const { getGun, isReady } = useGun();
  const [profilesByUsername, setProfilesByUsername] = useState({});

  useEffect(() => {
    if (isReady) {
      aliases.forEach(({ username }) => {
        getGun()
          .get(`~@${username}`)
          .get({ '.': { '*': '~' } })
          .get(`${username}/${GUN_PATH.profile}`)
          .get(GUN_KEY.profilePhoto)
          .get('url')
          .once((profilePhotoUrl) => {
            // TODO check profile[GUN_KEY.isListed]
            if (profilePhotoUrl) {
              setProfilesByUsername((p) => ({
                ...p,
                [username]: {
                  profilePhotoUrl,
                },
              }));
            }
          });
      });
    }
  }, [isReady]);

  return (
    <Box width="xlarge" gap="medium">
      <Box
        as="header"
        pad={{ vertical: 'xsmall' }}
        margin={{ top: 'xlarge' }}
        border={[
          {
            side: 'top',
            color: 'black',
            size: 'small',
            style: 'solid',
          },
          {
            side: 'bottom',
            color: 'black',
            size: 'small',
            style: 'solid',
          },
        ]}
        direction="row"
        justify="between"
        gap="small"
      >
        <Box>
          <Box
            width="200px"
            height={`${200 * logoRatio}px`}
            margin={{ top: '.5rem' }}
          >
            <NextImage src={vouchLogo} alt="Vouch" />
          </Box>
          <Text size="2em" weight={900}>
            DIRECTORY
          </Text>
        </Box>

        <Box as="aside">
          <Paragraph size="1.1em" textAlign="end">
            <i>
              Do you like the way we look— act— sound— <br />
              —are?
            </i>
          </Paragraph>
        </Box>
      </Box>
      {/* <Box height="medium" align="center" justify="center">
        <Paragraph size="xlarge">coming soon.</Paragraph>
      </Box> */}
      <Box pad="small">
        {Object.entries(profilesByUsername).map(
          ([username, { profilePhotoUrl }]) => (
            <Box key={username}>
              <Link href={`/profiles/${username}`}>
                <Square width="medium" elevation="small" round="xsmall">
                  <Image src={profilePhotoUrl} fit="cover" alt={username} />
                </Square>
              </Link>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}

Profiles.getLayout = function getLayout(page) {
  return (
    <PublicLayout>
      <Box direction="row" align="start" justify="center" gap="large">
        <Box>{page}</Box>
        <Box
          width="small"
          justify="end"
          pad={{ left: 'small', bottom: 'large' }}
        >
          <PublicNav />
          <VouchText />
        </Box>
      </Box>
    </PublicLayout>
  );
};

export async function getStaticProps({ params }) {
  // TODO cache this request
  const { data } = await axios.get(
    `https://api.forwardemail.net/v1/domains/${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}/aliases`,
    {
      auth: {
        username: process.env.FORWARD_EMAIL_API_KEY,
        password: '',
      },
    }
  );

  const aliases = data
    .filter((alias) => alias.is_enabled)
    .map((alias) => ({
      username: alias.name,
    }));

  // Pass profile data to the page via props
  return {
    props: { aliases },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every N seconds
    revalidate: 60 * 5, // In seconds
  };
}
