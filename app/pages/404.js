import { Box } from 'grommet';

import PublicLayout from 'components/PublicLayout';
import PublicNav from 'components/PublicNav';

export default function PageNotFound() {
  return (
    <Box fill background="neutral-2">
      <Box pad="small" align="end">
        <PublicNav />
      </Box>
      <Box fill align="center" justify="center" pad={{ bottom: 'xlarge' }}>
        <Box>This page could not be found.</Box>
      </Box>
    </Box>
  );
}
