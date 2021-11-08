// Global API token store
import React, { createContext, useContext, useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

type ApiToken = string | undefined;
type ApiTokenHeader =
  | {
      authorization: string;
    }
  | undefined;
type ApiTokenGetter = () => Promise<any>;

interface ContextValue {
  getTokenHeader: () => Promise<ApiTokenHeader>;
  setTokenGetter: (getter: ApiTokenGetter) => void;
}

const ApiTokenContext = createContext<ContextValue>({
  getTokenHeader: () => Promise.resolve(undefined),
  setTokenGetter: () => {},
});

export const ApiTokenProvider = ({ children }: Props) => {
  const getterRef = useRef<ApiTokenGetter>();

  const getTokenHeader: ContextValue['getTokenHeader'] = async () => {
    if (!getterRef.current) return;

    const token = await getterRef.current();

    if (token) {
      return {
        authorization: `Bearer ${token}`,
      };
    }
  };

  const setTokenGetter: ContextValue['setTokenGetter'] = (callback) => {
    getterRef.current = callback;

    return getterRef.current;
  };

  return (
    <ApiTokenContext.Provider
      value={{
        getTokenHeader,
        setTokenGetter,
      }}
    >
      {children}
    </ApiTokenContext.Provider>
  );
};

export default function useApiToken() {
  return useContext(ApiTokenContext);
}
