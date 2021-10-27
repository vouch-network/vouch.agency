import Link from 'next/link';
import Image from 'next/image';
import { Box, Paragraph, Heading, Text } from 'grommet';

import vouchText from 'data/vouchText';
import PublicLayout from 'components/PublicLayout';
// FIXME not rendering on server
import vouchAngencyLogo from 'public/images/vouch-agency-logo.svg';

const logoRatio = 30 / 100;

export default function Home() {
  return (
    <Box width="540px" alignSelf="center">
      <Box margin={{ top: 'xlarge' }}>
        <Paragraph>
          <Text size="xlarge" weight="bold">
            Do you like the way we look— act— sound— —are?
          </Text>
        </Paragraph>
      </Box>
      <Box
        align="center"
        margin={{ vertical: 'large' }}
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
            style: 'dotted',
          },
        ]}
      >
        <Box pad="medium">
          <Link href="/profiles">
            <Box width="300px" height={`${300 * logoRatio}px`}>
              {/* TODO interaction state */}
              <Image
                src={vouchAngencyLogo}
                alt="Vouch Agency"
                layout="intrinsic"
              />
            </Box>
          </Link>
        </Box>
      </Box>
      <Box>
        {vouchText.map((t, i) => (
          <Box key={i} as="section">
            <Heading level={3} size="small" margin={{ bottom: 'none' }}>
              {t.heading}
            </Heading>
            <Paragraph size="large">{t.body}</Paragraph>
          </Box>
        ))}

        <Box margin="large">
          <Text size="xlarge" textAlign="center">
            <Link href="/profiles">View the network directory</Link>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

Home.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};
