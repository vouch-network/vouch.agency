// Global API token store
import React, { createContext, useContext, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

type ApiToken = string;
type ApiTokenHeader =
  | {
      authorization: string;
    }
  | undefined;
type ApiTokenGetter = () => Promise<any>;

interface ContextValue {
  apiToken?: ApiToken;
  getTokenHeader: () => ApiTokenHeader | undefined;
  setApiToken: (arg: ApiToken | null) => void;
}

const ApiTokenContext = createContext<ContextValue>({
  apiToken: undefined,
  getTokenHeader: () => undefined,
  setApiToken: () => {},
});

export const ApiTokenProvider = ({ children }: Props) => {
  const [apiToken, setApiToken] = useState<ApiToken | null>();

  const getTokenHeader: ContextValue['getTokenHeader'] = () => {
    if (!apiToken) return undefined;

    return {
      authorization: `Bearer ${apiToken}`,
    };
  };

  return (
    <ApiTokenContext.Provider
      value={{
        getTokenHeader,
        setApiToken,
      }}
    >
      {children}
    </ApiTokenContext.Provider>
  );
};

export default function useApiToken() {
  return useContext(ApiTokenContext);
}
