import type { ReactNode } from 'react';
import { Box, Text } from 'grommet';

type Props = {
  children: ReactNode;
  status?: 'unknown' | 'ok' | 'warning' | 'error';
  detail?: ReactNode;
  plain?: boolean;
};

export default function StatusMessage({
  children,
  status = 'unknown',
  detail,
  plain,
}: Props) {
  const color = `status-${status}`;
  const boxProps: any = {};

  if (!plain) {
    boxProps.pad = 'small';
    boxProps.background = color;
  }

  return (
    <Box
      role="alert"
      round="xsmall"
      overflow="hidden"
      border={plain ? undefined : { color }}
    >
      <Box {...boxProps}>
        <Text weight="bold" color={plain ? color : undefined}>
          {' '}
          {children}
        </Text>
      </Box>
      {detail && (
        <Box pad="small">
          <Text color={color}>{detail}</Text>
        </Box>
      )}
    </Box>
  );
}
