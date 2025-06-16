import React, { useReducer } from 'react';
import { AppState } from '@/types';
import { getDataFromLocalStorage } from '@/utils/localStorage';
import { DEFAULT_NMPFILE, NMP_FILE_KEY } from '@/constants';
import { AppStateAction, appStateReducer } from '@/hooks/reducers/appStateReducer';

function initAppContext(): AppState {
  let nmpFile = getDataFromLocalStorage(NMP_FILE_KEY);
  if (nmpFile === null) {
    // No cached file, need to start from scratch
    nmpFile = DEFAULT_NMPFILE;
  }
  return {
    nmpFile,
    showAnimalsStep: false, // TODO: Change
  };
}

const initValue = initAppContext();
const AppStateContext = React.createContext(initValue);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AppDispatchContext = React.createContext((_action: AppStateAction) => {});

function AppStateProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [state, dispatch] = useReducer(appStateReducer, initValue);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export { AppStateContext, AppDispatchContext, AppStateProvider };
