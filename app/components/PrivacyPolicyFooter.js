import Link from 'next/link';
import { Box, Text } from 'grommet';

export default function PrivacyPolicyFooter() {
  return (
    <Box as="footer" pad="small">
      <Text size="xsmall">
        you are <Link href="/privacy">not being tracked</Link> on this site.
      </Text>
    </Box>
  );
}
