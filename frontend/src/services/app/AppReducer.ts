import AppActionType from './AppActions';

const { SET_NMP_FILE, SET_SHOW_ANIMALS_STEP } = AppActionType;

export type AppAction = {
  type: AppActionType;
  payload?: object;
};

// Initial settings state.
export const initialState = {
  nmpFile:
    '{"farmDetails":{"Year":"2024","FarmName":"Test Farm 1","FarmRegion":"9","FarmSubRegion":"47","SoilTests":null,"TestingMethod":null,"Manure":null,"HasSelectedFarmType":false,"ImportsManureCompost":false,"FarmAnimals":["1","2"],"HasHorticulturalCrops":true,"HasBerries":false,"HasVegetables":true,"LeafTests":null,"LeafTestingMethod":null,"UserJourney":0},"unsaved":false,"years":[{"Year":"2025","Fields":[],"FarmAnimals":[{"animalId":"1","subtype":"1","animalsPerFarm":"123","daysCollected":"32","manureData":{"name":"Cows (1300 lb), including Calves","annualSolidManure":118.170528}},{"animalId":"2","subtype":"6","breed":"1","manureType":"Liquid","grazingDaysPerYear":"032","animalsPerFarm":"123","manureData":{"name":"Heifers (6 to 15 months old)","annualSolidManure":1464.0794549999998}}],"FarmManures":[],"ImportedManures":[{"UniqueMaterialName":"Material 1","ManureTypeName":"Liquid","AnnualAmount":"321","AnnualAmountUSGallonsVolume":385.50495,"AnnualAmountCubicYardsVolume":0,"AnnualAmountCubicMetersVolume":0,"AnnualAmountTonsWeight":0,"AnnualAmountDisplayVolume":"386 U.S. gallons","AnnualAmountDisplayWeight":"","Units":1,"Moisture":"","IsMaterialStored":false,"ManagedManureName":"","ManureType":1,"AssignedToStoredSystem":false,"AssignedWithNutrientAnalysis":false},{"UniqueMaterialName":"Material 2","ManureTypeName":"Solid","AnnualAmount":"123","AnnualAmountUSGallonsVolume":0,"AnnualAmountCubicYardsVolume":160.87785,"AnnualAmountCubicMetersVolume":123,"AnnualAmountTonsWeight":0,"AnnualAmountDisplayVolume":"161 yards³ (123 m³)","AnnualAmountDisplayWeight":"43 tons","Units":2,"Moisture":"32","IsMaterialStored":false,"ManagedManureName":"","ManureType":2,"AssignedToStoredSystem":false,"AssignedWithNutrientAnalysis":false}],"SeparatedSolidManures":[],"ManureStorageSystems":[],"GeneratedManures":[{"AnnualAmountUSGallonsVolume":0,"AnnualAmountTonsWeight":118.170528,"AnnualAmountDisplayWeight":"118 tons","ManagedManureName":"","ManureType":0,"IsMaterialStored":false,"AssignedToStoredSystem":false,"AssignedWithNutrientAnalysis":false,"UniqueMaterialName":"Cows (1300 lb), including Calves","ManureTypeName":"2","AnnualAmount":118.170528},{"AnnualAmountUSGallonsVolume":0,"AnnualAmountTonsWeight":1464.0794549999998,"AnnualAmountDisplayWeight":"1464 tons","ManagedManureName":"","ManureType":0,"IsMaterialStored":false,"AssignedToStoredSystem":false,"AssignedWithNutrientAnalysis":false,"UniqueMaterialName":"Heifers (6 to 15 months old)","ManureTypeName":"2","AnnualAmount":1464.0794549999998}]},{"Year":"2024","Fields":[],"FarmAnimals":[],"FarmManures":[],"GeneratedManures":[],"ImportedManures":[],"SeparatedSolidManures":[],"ManureStorageSystems":[]}],"LastAppliedFarmManureId":null,"NMPReleaseVersion":0}',
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
    case SET_SHOW_ANIMALS_STEP:
      return { ...state, showAnimalsStep: action.payload };
    default:
      throw new Error();
  }
};
