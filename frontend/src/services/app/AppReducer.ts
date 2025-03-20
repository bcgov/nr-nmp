import AppActionType from './AppActions';

const { SET_NMP_FILE, SET_PROGRESS_STEP } = AppActionType;

export type AppAction = {
  type: AppActionType;
  payload?: object;
};

// Initial settings state.
export const initialState = {
  nmpFile: '',
  step: '',
};

/**
 * @summary Handles app actions and returns the updated app state.
 * @param   {object} state - The current app state.
 * @param   {AppAction} action - The app action to be handled.
 * @returns {object} - The updated app state.
 */
export const reducer = (state: object, action: AppAction): object => {
  switch (action.type) {
    case SET_NMP_FILE:
      return { ...state, nmpFile: action.payload };
    case SET_PROGRESS_STEP:
      return { ...state, step: action.payload };
    default:
      throw new Error();
  }
};
