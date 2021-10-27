import Link from 'next/link';
import { Header, Box, Button, Nav, Text, Paragraph } from 'grommet';

import vouchText from 'data/vouchText';
import Logo from 'components/Logo';
import { colors } from 'utils/theme';

export default function PublicNav() {
  return (
    <Nav
      align="end"
      border={[
        {
          side: 'left',
          color: 'brand',
          size: 'small',
          style: 'solid',
        },
      ]}
      pad={{ left: 'small' }}
    >
      <Link href="/">
        <Box>
          <Logo width={150} />
        </Box>
      </Link>
      <Link href="/profiles">Directory</Link>
      <Link href="/network">Network</Link>
    </Nav>
  );
}
