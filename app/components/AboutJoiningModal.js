import { Anchor, Box, Button, Text, Layer } from 'grommet';

import AboutJoining from 'components/AboutJoining';

export default function AboutJoiningModal({ onAccept, onReject }) {
  return (
    <Layer margin="large">
      <Box pad="large" overflow="auto">
        <AboutJoining />
        <div>
          <Box margin={{ vertical: 'medium' }}>
            <Text>
              By continuing, I acknowledge that I read all of the above.
              <br />
              <br />
              If I didn't read all of it, I'll open{' '}
              <Anchor href="/joining" target="_blank">
                this link to bookmark
              </Anchor>{' '}
              it and read it soon.
            </Text>
          </Box>
          <Box align="center" gap="medium">
            <Button label="Continue to sign up" primary onClick={onAccept} />
            <Box>
              <Anchor size="small" onClick={onReject}>
                Decline to continue
              </Anchor>
            </Box>
          </Box>
        </div>
      </Box>
    </Layer>
  );
}
