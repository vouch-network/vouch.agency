import Link from 'next/link';
import Head from 'next/head';
import { Anchor, Box, Heading, Image, Grid, Paragraph, Text } from 'grommet';

import PublicLayout from 'components/PublicLayout';
import PublicNav from 'components/PublicNav';

export default function Profile({ profile }) {
  return (
    <>
      <Head>
        <title>
          {profile.displayName || 'Network Member'} | VOUCH AGENCY |
          "decentralized" casting
        </title>
      </Head>
      <Box width="1300px" alignSelf="center">
        <Box height="medium" align="center" justify="center">
          <Paragraph size="xlarge">coming soon.</Paragraph>
        </Box>

        <Grid
          areas={[
            ['photo', 'info'],
            ['media', 'media'],
          ]}
          columns={['auto', 'auto']}
          rows={['auto', 'auto']}
          gap="medium"
          align="center"
        >
          <Box gridArea="photo" align="end">
            <Box
              as="figure"
              width="600px"
              height="600px"
              margin="none"
              // background="accent-3"
            >
              {profile.profilePhoto?.url && (
                <Image
                  src={profile.profilePhoto.url}
                  fit="contain"
                  alt={`Picture of ${profile.displayName}`}
                />
              )}
            </Box>
          </Box>

          <Box gridArea="info" gap="small" pad="medium">
            <Box as="header">
              <Heading size="small" margin="none">
                {profile.displayName}
              </Heading>
              {profile.location && (
                <Heading level={2} size="small" margin="none">
                  {profile.location}
                </Heading>
              )}
            </Box>
            {profile.pronouns && (
              <Paragraph margin="none">{profile.pronouns}</Paragraph>
            )}
            {profile.bio && <Paragraph margin="none">{profile.bio}</Paragraph>}
            {profile.username && (
              <Paragraph margin="none">
                Send inquiries to{' '}
                <Anchor
                  href={`mailto:${profile.username}@${process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}`}
                >
                  {profile.username}@
                  {process.env.NEXT_PUBLIC_FORWARD_EMAIL_DOMAIN}
                </Anchor>
                .
              </Paragraph>
            )}
          </Box>

          <Box gridArea="media" direction="row" wrap>
            {profile.profileMedia?.map((media) => (
              <Box key={media.id} pad="medium">
                <Box as="figure" width="600px" height="600px" margin="none">
                  <Image src={media.url} fit="contain" />
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Box>
    </>
  );
}

Profile.getLayout = function getLayout(page) {
  return (
    <PublicLayout>
      <Box direction="row" align="start" justify="center" gap="large">
        <Box>{page}</Box>
        <PublicNav />
      </Box>
    </PublicLayout>
  );
};

export async function getStaticPaths() {
  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/agency/profiles`
  // );
  // const profiles = await res.json();

  // TODO
  const profiles = [];

  // Get the paths we want to pre-render based on posts
  const paths = profiles.map((post) => ({
    params: { username: post.username },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/agency/profiles/${params.username}`
  // );
  // const profile = await res.json();

  // TODO
  const profile = {};

  // Pass profile data to the page via props
  return {
    props: { profile },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every N seconds
    revalidate: 60, // In seconds
  };
}
