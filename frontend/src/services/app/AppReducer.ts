import AppActionType from './AppActions';

const { SET_NMP_FILE, SET_PROGRESS_STEP, SET_SHOW_ANIMALS_STEP } = AppActionType;

export type AppAction = {
  type: AppActionType;
  payload?: object;
};

// Initial settings state.
export const initialState = {
  nmpFile:
    '{"farmDetails":{"Year":"2025","FarmName":"Test Farm 1","FarmRegion":"2","FarmSubRegion":"78","SoilTests":null,"TestingMethod":null,"Manure":null,"HasSelectedFarmType":false,"ImportsManureCompost":false,"FarmAnimals":[],"HasHorticulturalCrops":true,"HasBerries":true,"HasVegetables":true,"LeafTests":null,"LeafTestingMethod":null,"UserJourney":0},"unsaved":false,"years":[{"Year":"2025","Fields":[{"FieldName":"Field 1","Area":345345,"PreviousYearManureApplicationFrequency":"1","Comment":"Test comment 1","SoilTest":{"sampleDate":"2025-03","valNO3H":"2","valP":"3","valK":"4","valPH":"5","soilTest":""},"Crops":[]},{"FieldName":"Field 2","Area":5,"PreviousYearManureApplicationFrequency":"2","Comment":"Test comment 2","SoilTest":{"sampleDate":"2025-05","valNO3H":"6","valP":"5","valK":"4","valPH":"3","soilTest":""},"Crops":[]}],"FarmAnimals":[],"FarmManures":[],"GeneratedManures":[],"ImportedManures":[],"SeparatedSolidManures":[],"ManureStorageSystems":[]}],"LastAppliedFarmManureId":null,"NMPReleaseVersion":0}',
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
      return { ...state, nmpFile: action.payload };
    case SET_PROGRESS_STEP:
      return { ...state, step: action.payload };
    case SET_SHOW_ANIMALS_STEP:
      return { ...state, showAnimalsStep: action.payload };
    default:
      throw new Error();
  }
};
