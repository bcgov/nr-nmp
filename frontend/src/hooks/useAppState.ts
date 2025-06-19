import { useContext, useMemo, ActionDispatch } from 'react';
import { AppDispatchContext, AppStateContext } from '../context/AppStateContext';
import { AppState } from '@/types';
import { AppStateAction } from './reducers/appStateReducer';

/**
 * @summary Custom hook that provides app related functions
 */
const useAppState = () => {
  const state = useContext<AppState>(AppStateContext);
  const dispatch = useContext<ActionDispatch<[action: AppStateAction]>>(AppDispatchContext);

  return useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );
};

export default useAppState;
