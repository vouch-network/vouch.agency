import { Box, Paragraph, Heading, Text } from 'grommet';

import PublicNav from 'components/PublicNav';
import PublicLayout from 'components/PublicLayout';

export default function Privacy() {
  return (
    <Box alignSelf="center">
      <Heading>Privacy</Heading>
      <Heading level={2} margin={{ bottom: 'none' }}>
        Vouch Agency
      </Heading>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        You are not being tracked.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        There is no data on you being stored anywhere, in this app or in any
        third party service.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        This means there is no data to feed neural networks. This means there is
        no machine learning algorithm that nudges you towards one person or
        another.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        In these ways, you, in both flawed and enchanting ways, have final
        Agency.
      </Paragraph>
      <Heading level={2} margin={{ bottom: 'none' }}>
        Vouch Network
      </Heading>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        Your data is not being stored in a central database. Your data is
        distributed and synced using peer-to-peer technology across all network
        members.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        This means that there is no one server or person who retains a full copy
        of your data. This means that no companies own your data or have access
        to your data. This means your data is impervious to hacks targeted at
        companies and data centers.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        By being a Vouch Network member, you agree to peer with other Network
        members to collectively provide one another with the greatest level of
        privacy possible on the open web.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        The technology used to build Vouch Network is a core extension of Vouch
        A/N values of community, privacy and anti-surveillance. The technology
        used to build Vouch A/N is chosen specifically to prioritize{' '}
        <em>relationships</em> between members of the network ("nodes") rather
        than charge nodes in isolation with safeguarding their "individual"
        privacy.
      </Paragraph>
      <Paragraph size="large" margin={{ vertical: 'small' }}>
        In these ways, Vouch is Network agency.
      </Paragraph>
    </Box>
  );
}

Privacy.getLayout = function getLayout(page) {
  return (
    <PublicLayout>
      <Box align="end">
        <PublicNav />
      </Box>
      <Box>{page}</Box>
    </PublicLayout>
  );
};
