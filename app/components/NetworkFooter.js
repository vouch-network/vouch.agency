import { useState } from 'react';
import { useRouter } from 'next/router';
import { Footer, Box, Button, Nav, Text, Layer } from 'grommet';

import useUser from 'components/useUser';
import useGun from 'components/useGun';
import Logo from 'components/Logo';
import { colors } from 'utils/theme';

export default function NetworkAFooter() {
  const router = useRouter();
  const { user } = useUser();
  const { logout } = useGun();
  const [isOpen, setIsOpen] = useState(false);

  const handleClickLogOut = () => {
    logout();

    router.push('/network');
  };

  return (
    <>
      {user && (
        <Footer justify="between" pad="small">
          <Button
            size="small"
            label="Having trouble with the app?"
            onClick={() => setIsOpen(true)}
          />

          <Button
            size="small"
            label="Log out"
            onClick={handleClickLogOut}
            primary
          />
        </Footer>
      )}

      {isOpen && (
        <Layer
          modal={false}
          position="bottom-left"
          onClickOutside={() => setIsOpen(false)}
          onEsc={() => setIsOpen(false)}
        >
          <Box pad="small" width="medium">
            Having an issue with the app? It's still in beta so please let sua
            know! xoxo
            <ol>
              <li>take a screenshot</li>
              <li>text or email it to sua admin@suayoo.online</li>
            </ol>
            <Box align="start">
              <Button
                size="small"
                label="Okay!"
                onClick={() => setIsOpen(false)}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  );
}
