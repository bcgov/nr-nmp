import React, { createContext } from 'react';
import APICache from '@/services/APICache';

const cache = new APICache();
const APICacheContext = createContext(cache);

function APICacheProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  return <APICacheContext.Provider value={cache}>{children}</APICacheContext.Provider>;
}

export { APICacheContext, APICacheProvider };
