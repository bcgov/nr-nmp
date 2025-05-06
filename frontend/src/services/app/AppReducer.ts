import AppActionType from './AppActions';

const { SET_NMP_FILE, SET_SHOW_ANIMALS_STEP } = AppActionType;

export type AppAction = {
  type: AppActionType;
  payload?: object;
};

// Initial settings state.
export const initialState = {
  nmpFile:
    '{"farmDetails":{"Year":"2025","FarmName":"Test Farm 1","FarmRegion":"6","FarmSubRegion":"42","SoilTests":null,"TestingMethod":null,"Manure":null,"HasSelectedFarmType":false,"ImportsManureCompost":false,"FarmAnimals":["1","2"],"HasHorticulturalCrops":false,"HasBerries":false,"HasVegetables":false,"LeafTests":null,"LeafTestingMethod":null,"UserJourney":0},"unsaved":false,"years":[{"Year":"2025","Fields":[],"FarmAnimals":[],"FarmManures":[],"GeneratedManures":[],"ImportedManures":[],"SeparatedSolidManures":[],"ManureStorageSystems":[]}],"LastAppliedFarmManureId":null,"NMPReleaseVersion":0}',
  step: '',
  showAnimalsStep: false,
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
      console.log(action.payload)
      return { ...state, nmpFile: action.payload };
    case SET_SHOW_ANIMALS_STEP:
      return { ...state, showAnimalsStep: action.payload };
    default:
      throw new Error();
  }
};
