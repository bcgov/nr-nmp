import { useContext, useMemo } from 'react';
import constants from '../../constants/Constants';
import { AppContext } from '../../context/AppProvider';
import AppActionType from './AppActions';
import { saveDataToLocalStorage } from '../../utils/AppLocalStorage';

const { SET_NMP_FILE, SET_PROGRESS_STEP, SET_SHOW_ANIMALS_STEP } = AppActionType;

/**
 * @summary Custom hook that provides app related functions
 */
const useAppService = () => {
  const { state, dispatch } = useContext<any>(AppContext);

  return useMemo(() => {
    /**
     * @summary Set nmp to local storage and state
     */
    const setNMPFile = async (nmpFile: string | ArrayBuffer) => {
      try {
        saveDataToLocalStorage(constants.NMP_FILE_KEY, nmpFile);
        dispatch({ type: SET_NMP_FILE, payload: nmpFile });
      } catch (e) {
        console.error(e);
      }
    };

    const setProgressStep = (step: number) => {
      dispatch({ type: SET_PROGRESS_STEP, payload: step });
    };

    const setShowAnimalsStep = (showAnimals: boolean) => {
      dispatch({ type: SET_SHOW_ANIMALS_STEP, payload: showAnimals });
    };

    return {
      setProgressStep,
      setNMPFile,
      setShowAnimalsStep,
      state,
    };
  }, [state, dispatch]);
};

export default useAppService;
