import { useState, useEffect, useRef, createContext, useContext } from 'react';

const SESSION_CHANNEL_NAME = 'va_session-channel';
const SESSION_CHANNEL_KEY = 'va_session-shared';

const EVENT_NAME = {
  REQUESTING_SHARED: 'REQUESTING_SHARED',
  PROVIDING_SHARED: 'PROVIDING_SHARED',
  ADDED_TO_SHARED: 'ADDED_TO_SHARED',
};

type Message = {
  eventName: string;
  value?: { [key: string]: any };
};

interface ContextValue {
  onMessage: (cb: Function) => void;
  postMessage: (msg: any) => void;
  addToStorage: (data: any) => void;
}

const SessionChannelContext = createContext<ContextValue>({
  onMessage: () => {},
  postMessage: () => {},
  addToStorage: () => {},
});

// Sync session storage across tabs using a Broadcast Channel
export const SessionChannelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const addToStorage = (data: any) => {
    const storedVal = window.sessionStorage.getItem(SESSION_CHANNEL_KEY);
    const storedValParsed = storedVal ? JSON.parse(storedVal) : {};

    window.sessionStorage.setItem(
      SESSION_CHANNEL_KEY,
      JSON.stringify({
        ...storedValParsed,
        ...data,
      })
    );
  };

  const channelRef = useRef<BroadcastChannel | undefined>(
    (() => {
      // prevent channel creation from running on server
      if (!process.browser) {
        return undefined;
      }

      const channel = new BroadcastChannel(SESSION_CHANNEL_NAME);

      // let other tabs know we're here, in case one has shared data
      const initialMessage: Message = {
        eventName: EVENT_NAME.REQUESTING_SHARED,
      };
      channel.postMessage(initialMessage);

      // check if other tabs need shared data
      channel.onmessage = (e) => {
        if (e.isTrusted) {
          const { eventName, value }: Message = e.data;

          const storedVal = window.sessionStorage.getItem(SESSION_CHANNEL_KEY);

          switch (eventName) {
            case EVENT_NAME.REQUESTING_SHARED: {
              if (storedVal) {
                // automatically send to tab
                channel.postMessage({
                  eventName: EVENT_NAME.PROVIDING_SHARED,
                  value: JSON.parse(storedVal),
                });
              }

              break;
            }
            case EVENT_NAME.PROVIDING_SHARED: {
              addToStorage(value);

              break;
            }
            default:
              break;
          }
        }
      };

      return channel;
    })()
  );

  useEffect(() => {
    return () => {
      channelRef.current?.close();
    };
  }, []);

  const onMessage: ContextValue['onMessage'] = (cb: Function) => {
    if (channelRef.current) {
      const onmessage = channelRef.current.onmessage;

      channelRef.current.onmessage = (e: any) => {
        // @ts-ignore
        onmessage(e);
        cb(e.data);
      };
    }
  };

  const postMessage: ContextValue['postMessage'] = (message: Message) => {
    channelRef.current?.postMessage(message);
  };

  return (
    <SessionChannelContext.Provider
      value={{
        onMessage,
        postMessage,
        addToStorage,
      }}
    >
      {children}
    </SessionChannelContext.Provider>
  );
};

export default function useSessionChannel() {
  return useContext(SessionChannelContext);
}
