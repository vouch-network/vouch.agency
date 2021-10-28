import Link from 'next/link';
import Image from 'next/image';
import { Box, Paragraph, Heading, Text } from 'grommet';

import PublicLayout from 'components/PublicLayout';
import PublicNav from 'components/PublicNav';
import VouchText from 'components/VouchText';
import vouchLogo from 'public/images/vouch-logo.svg';

const logoRatio = 20 / 100;

export default function Profiles({ profiles }) {
  // console.log('profiles:', profiles);

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
            <Image src={vouchLogo} alt="Vouch" />
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
      <Box height="medium" align="center" justify="center">
        <Paragraph size="xlarge">coming soon.</Paragraph>
      </Box>
      <Box pad="small">
        {profiles.map((p) => (
          <Box key={p.id}>
            <Link href={`/profiles/${p.username}`}>{p.username}</Link>
          </Box>
        ))}
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
  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/agency/profiles`
  // );
  // const profiles = await res.json();

  // TODO
  const profiles = [];

  // Pass profile data to the page via props
  return {
    props: { profiles },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every N seconds
    revalidate: 60, // In seconds
  };
}
