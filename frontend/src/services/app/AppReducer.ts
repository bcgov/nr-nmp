import AppActionType from './AppActions';

const { SET_NMP_FILE, SET_PROGRESS_STEP, SET_SHOW_ANIMALS_STEP } = AppActionType;

export type AppAction = {
  type: AppActionType;
  payload?: object;
};

// Initial settings state.
export const initialState = {
  nmpFile:
    // '{"farmDetails":{"Year":"2025","FarmName":"Test Farm 1","FarmRegion":"6","FarmSubRegion":"42","SoilTests":null,"TestingMethod":null,"Manure":null,"HasSelectedFarmType":false,"ImportsManureCompost":false,"FarmAnimals":["1","2"],"HasHorticulturalCrops":false,"HasBerries":false,"HasVegetables":false,"LeafTests":null,"LeafTestingMethod":null,"UserJourney":0},"unsaved":false,"years":[{"Year":"2025","Fields":[],"FarmAnimals":[],"FarmManures":[],"GeneratedManures":[],"ImportedManures":[],"SeparatedSolidManures":[],"ManureStorageSystems":[]}],"LastAppliedFarmManureId":null,"NMPReleaseVersion":0}',
    '{"farmDetails":{"Year":"2025","FarmName":"Test Farm 1","FarmRegion":"6","FarmSubRegion":"42","SoilTests":null,"TestingMethod":null,"Manure":null,"HasSelectedFarmType":false,"ImportsManureCompost":false,"FarmAnimals":["1","2"],"HasHorticulturalCrops":false,"HasBerries":false,"HasVegetables":false,"LeafTests":null,"LeafTestingMethod":null,"UserJourney":0},"unsaved":false,"years":[{"Year":"2025","Fields":[],"FarmAnimals":[{"animalId":"1","subtype":"1","animalsPerFarm":"6","daysCollected":"1"},{"animalId":"2","subtype":"5","breed":"2","manureType":"Solid","grazingDaysPerYear":"5","animalsPerFarm":"6"},{"animalId":"1","subtype":"2","animalsPerFarm":"6","daysCollected":0},{"animalId":"2","subtype":"5","breed":"2","manureType":"Liquid","grazingDaysPerYear":"3","animalsPerFarm":"12"},{"animalId":"2","subtype":"5","breed":"2","manureType":"Liquid","grazingDaysPerYear":"5","animalsPerFarm":"1"}],"FarmManures":[],"GeneratedManures":[],"ImportedManures":[],"SeparatedSolidManures":[],"ManureStorageSystems":[]}],"LastAppliedFarmManureId":null,"NMPReleaseVersion":0}',  
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
