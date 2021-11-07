import type { ReactNode } from 'react';
import { Box, Text, Tip } from 'grommet';

type Props = {
  children: ReactNode;
  content: ReactNode;
};

export default function Tooltip({
  children,
  content,
  ...unhandledProps
}: Props) {
  return (
    <Tip
      content={
        <Box
          background="dark-1"
          round="xsmall"
          pad={{ top: '.2em', bottom: '.3em', horizontal: '.6em' }}
        >
          <Text size="small" textAlign="center" color="accent-1">
            {content}
          </Text>
        </Box>
      }
      plain
      {...unhandledProps}
    >
      {children}
    </Tip>
  );
}
