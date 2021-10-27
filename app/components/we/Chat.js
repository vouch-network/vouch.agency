import { useRef, useEffect, useState } from 'react';
import { Grid, Box, Button, Text, Anchor, Image, TextInput } from 'grommet';

import useGun from 'components/useGun';
import useUser from 'components/useUser';

function ChatInput({ send }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    send(inputValue);

    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="row">
        <TextInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Message the network"
          required
        />
        <Box width="9em" justify="center" align="center">
          <Text size="small" color="dark-4">
            hit enter to send
          </Text>
        </Box>
      </Box>
    </form>
  );
}

export default function Chat() {
  const gunEventRef = useRef();
  const { getGun, getCertificate } = useGun();
  const chatBoxRef = useRef();
  const { user } = useUser();
  const [messages, setMessages] = useState({});

  useEffect(() => {
    getGun()
      .get(`~${process.env.NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
      .get('chatLog')
      .map()
      .get('main-room')
      .on(
        (msgStr, pub, _msg, _event) => {
          if (typeof msgStr === 'string') {
            const msg = JSON.parse(msgStr);

            setMessages((m) => ({
              ...m,
              [msg.ts]: {
                text: msg.msg,
                username: msg.u,
              },
            }));
          }

          gunEventRef.current = _event;
        },
        {
          change: true,
        }
      );

    return () => {
      if (gunEventRef.current?.off) {
        gunEventRef.current.off();
      }
    };
  }, []);

  useEffect(() => {
    // TODO scroll to botton on click
    // chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const send = (msg) => {
    getGun()
      .get(`~${process.env.NEXT_PUBLIC_GUN_APP_PUBLIC_KEY}`)
      .get('chatLog')
      .get(user.pub)
      .get('main-room')
      // stringify so that we're only storing the last
      // message in the db
      .put(
        JSON.stringify({
          ts: Date.now(),
          msg: msg,
          u: user.username,
        }),
        ({ err }) => {
          if (err) {
            console.log(err);
          }
        },
        {
          opt: {
            cert: getCertificate(),
          },
        }
      );
  };

  return (
    <Box fill>
      <Box ref={chatBoxRef} fill overflow="auto">
        <Box
          as="ol"
          margin="none"
          pad="none"
          style={{
            display: 'block',
            listStyle: 'none',
            scrollBehavior: 'auto',
            fontSize: '.9em',
          }}
        >
          {Object.entries(messages).map(([ts, msg]) => {
            return (
              <Box pad={{ vertical: 'small' }} as="li" key={ts}>
                <Text size="small" weight="bold" color="accent-3">
                  {msg.username}
                </Text>
                <Text color="light-4">{msg.text}</Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      <ChatInput send={send} />
    </Box>
  );
}
