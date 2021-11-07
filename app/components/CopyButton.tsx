import { useState, useRef, useEffect, ReactNode } from 'react';
import { Text, Button } from 'grommet';
import { Copy } from 'grommet-icons';

import Tooltip from 'components/Tooltip';

const Icon = () => <Copy />;

type Props = {
  message: string;
  children?: ReactNode;
};

export default function CopyButton({
  children,
  message,
  ...unhandledProps
}: Props) {
  const timeoutRef = useRef<number>();
  const [isCopied, setIsCopied] = useState<boolean>();

  const copy = async () => {
    await window.navigator.clipboard.writeText(message);

    timeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1000);

    setIsCopied(true);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Tooltip content={isCopied ? 'Copied' : 'Tap to copy'}>
      <Button {...unhandledProps} onClick={copy}>
        {children || <Icon />}
      </Button>
    </Tooltip>
  );
}
