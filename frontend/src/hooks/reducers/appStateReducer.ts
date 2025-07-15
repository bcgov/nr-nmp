/* eslint-disable no-param-reassign */
import { DEFAULT_NMPFILE, DEFAULT_NMPFILE_YEAR, NMP_FILE_KEY } from '@/constants';
import DefaultGeneratedManureFormData from '@/constants/DefaultGeneratedManureData';
import {
  NMPFileFieldData,
  NMPFileFarmManureData,
  NMPFileImportedManureData,
  AnimalData,
  NMPFileYear,
  DAIRY_COW_ID,
  MILKING_COW_ID,
  NMPFileGeneratedManureData,
  AppState,
  NMPFile,
  NMPFileFarmDetails,
} from '@/types';
import { saveDataToLocalStorage } from '@/utils/localStorage';
import { getLiquidManureDisplay, getSolidManureDisplay } from '@/utils/utils';

type SetShowAnimalsStepAction = {
  type: 'SET_SHOW_ANIMALS_STEP';
  showAnimalsStep: boolean;
};

type SaveFarmDetailsAction = {
  type: 'SAVE_FARM_DETAILS';
  newFarmDetails: NMPFileFarmDetails;
};

type SaveFieldsAction = {
  type: 'SAVE_FIELDS';
  year: string;
  newFields: NMPFileFieldData[];
};

type SaveFarmManureAction = {
  type: 'SAVE_FARM_MANURE';
  year: string;
  newManures: NMPFileFarmManureData[];
};

type SaveImportedManureAction = {
  type: 'SAVE_IMPORTED_MANURE';
  year: string;
  newManures: NMPFileImportedManureData[];
};

type SaveAnimalsAction = {
  type: 'SAVE_ANIMALS';
  year: string;
  newAnimals: AnimalData[];
};

type ClearAnimalsAction = {
  type: 'CLEAR_ANIMALS';
  year: string;
};

type OverwriteNMPFileAction = {
  type: 'OVERWRITE_NMPFILE';
  newFile: NMPFile;
};

type ResetNMPFileAction = {
  type: 'RESET_NMPFILE';
};

export type AppStateAction =
  | SetShowAnimalsStepAction
  | SaveFarmDetailsAction
  | SaveFieldsAction
  | SaveFarmManureAction
  | SaveImportedManureAction
  | SaveAnimalsAction
  | ClearAnimalsAction
  | OverwriteNMPFileAction
  | ResetNMPFileAction;

function saveAnimals(newFileYear: NMPFileYear, newAnimals: AnimalData[]) {
  newFileYear.FarmAnimals = structuredClone(newAnimals);

  // Update GeneratedManures
  const generatedManures: NMPFileGeneratedManureData[] = [];
  for (let i = 0; i < newAnimals.length; i += 1) {
    const animal = newAnimals[i];
    if (animal.manureData !== undefined) {
      if (animal.animalId === DAIRY_COW_ID && animal.subtype === MILKING_COW_ID) {
        // TODO: Add wash water as manure. We're ignoring a lot of dairy cow stuff for now
      }

      if (animal.manureData.annualSolidManure !== undefined) {
        generatedManures.push({
          ...DefaultGeneratedManureFormData,
          UniqueMaterialName: animal.manureData.name,
          ManureTypeName: '2',
          AnnualAmount: animal.manureData.annualSolidManure,
          AnnualAmountTonsWeight: animal.manureData.annualSolidManure,
          AnnualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
          // Link the generated manure to the animal that created it
          entryId: animal.entryId,
        });
      } else {
        generatedManures.push({
          ...DefaultGeneratedManureFormData,
          UniqueMaterialName: animal.manureData.name,
          ManureTypeName: '1',
          AnnualAmount: animal.manureData.annualLiquidManure,
          AnnualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
          AnnualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          entryId: animal.entryId,
        });
      }
    }
  }
  newFileYear.GeneratedManures = generatedManures;
}

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  // In this reducer, we take advantage of JavaScript storing/passing objects as addresses
  // This allows us to clone the state and then edit it in-place
  const newAppState = structuredClone(state);

  // These actions alter more than the NMPFile years array
  if (action.type === 'SET_SHOW_ANIMALS_STEP') {
    newAppState.showAnimalsStep = action.showAnimalsStep;
    return newAppState;
  }

  if (action.type === 'OVERWRITE_NMPFILE') {
    newAppState.nmpFile = structuredClone(action.newFile);
    saveDataToLocalStorage(NMP_FILE_KEY, newAppState.nmpFile);
    return newAppState;
  }

  if (action.type === 'RESET_NMPFILE') {
    newAppState.nmpFile = structuredClone(DEFAULT_NMPFILE);
    saveDataToLocalStorage(NMP_FILE_KEY, newAppState.nmpFile);
    return newAppState;
  }

  if (action.type === 'SAVE_FARM_DETAILS') {
    // Years *is* an array, but we don't like that and cheat to make it a single-value array
    // Make new blank year if no year exists or if we have a different year saved
    if (
      newAppState.nmpFile.years.length === 0 ||
      action.newFarmDetails.Year !== newAppState.nmpFile.years[0].Year
    ) {
      newAppState.nmpFile.years = [{ ...DEFAULT_NMPFILE_YEAR, Year: action.newFarmDetails.Year }];
      // Otherwise, keep the existing year and edit as necessary
    } else if (
      action.newFarmDetails.FarmAnimals === undefined ||
      action.newFarmDetails.FarmAnimals.length === 0
    ) {
      // Clear the animals array if animals have been removed
      saveAnimals(newAppState.nmpFile.years[0], []);
    }
    newAppState.nmpFile.farmDetails = structuredClone(action.newFarmDetails);
    saveDataToLocalStorage(NMP_FILE_KEY, newAppState.nmpFile);
    return newAppState;
  }

  // These actions alter one index of the NMPFile years array
  // Remember: all the below steps edit the NMPFile in-place! So functions don't return anything
  const year = newAppState.nmpFile.years.find((y) => y.Year === action.year);
  if (year === undefined) throw new Error(`Reducer received nonexistent year: ${action.year}`);
  if (action.type === 'SAVE_FIELDS') {
    year.Fields = structuredClone(action.newFields);
  } else if (action.type === 'SAVE_FARM_MANURE') {
    year.FarmManures = structuredClone(action.newManures);
  } else if (action.type === 'SAVE_IMPORTED_MANURE') {
    year.ImportedManures = structuredClone(action.newManures);
  } else if (action.type === 'SAVE_ANIMALS') {
    saveAnimals(year, action.newAnimals);
  } else if (action.type === 'CLEAR_ANIMALS') {
    year.FarmAnimals = undefined;
    year.GeneratedManures = undefined;
  }
  console.log('year', year);
  // Save the file to local storage
  saveDataToLocalStorage(NMP_FILE_KEY, newAppState.nmpFile);
  return newAppState;
}
