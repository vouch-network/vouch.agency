import { Box, Paragraph, Heading, Text } from 'grommet';

import PublicNav from 'components/PublicNav';
import PublicLayout from 'components/PublicLayout';
import AboutJoining from 'components/AboutJoining';

export default function Joining() {
  return (
    <Box alignSelf="center">
      <AboutJoining />
    </Box>
  );
}

Joining.getLayout = function getLayout(page) {
  return (
    <PublicLayout>
      <Box align="end">
        <PublicNav />
      </Box>
      <Box>{page}</Box>
    </PublicLayout>
  );
};
