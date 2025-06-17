/* eslint-disable no-param-reassign */
import { DEFAULT_NMPFILE, NMP_FILE_KEY } from '@/constants';
import DefaultGeneratedManureFormData from '@/constants/DefaultGeneratedManureData';
import {
  NMPFileNutrientRow,
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
} from '@/types';
import { saveDataToLocalStorage } from '@/utils/localStorage';
import { getLiquidManureDisplay, getSolidManureDisplay } from '@/utils/utils';

type SetShowAnimalsStepAction = {
  type: 'SET_SHOW_ANIMALS_STEP';
  showAnimalsStep: boolean;
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
  | SaveFieldsAction
  | SaveFarmManureAction
  | SaveImportedManureAction
  | SaveAnimalsAction
  | ClearAnimalsAction
  | OverwriteNMPFileAction
  | ResetNMPFileAction;

function updateCropNutrients(field: NMPFileFieldData) {
  let nutrients = field.Nutrients;
  if (nutrients !== undefined) {
    nutrients = nutrients.reduce((acc, row) => {
      if (row.type === 'crop') {
        // Remove rows of deleted crops
        if (field.Crops.some((crop) => crop.index === row.cropIndex)) {
          acc.push(row);
        }
      } else {
        // Don't touch non-crop rows
        acc.push(row);
      }
      return acc;
    }, [] as NMPFileNutrientRow[]);
  } else {
    nutrients = [];
  }
  // Add rows for new crops
  field.Crops.forEach((crop) => {
    if (!nutrients!.some((row) => row.type === 'crop' && row.cropIndex === crop.index)) {
      nutrients?.push({
        index: nutrients.length === 0 ? 0 : nutrients[nutrients.length - 1].index + 1,
        type: 'crop',
        cropIndex: crop.index,
      });
    }
  });
  field.Nutrients = nutrients;
}

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
          index: generatedManures.length,
          UniqueMaterialName: animal.manureData.name,
          ManureTypeName: '2',
          AnnualAmount: animal.manureData.annualSolidManure,
          AnnualAmountTonsWeight: animal.manureData.annualSolidManure,
          AnnualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
        });
      } else {
        generatedManures.push({
          ...DefaultGeneratedManureFormData,
          index: generatedManures.length,
          UniqueMaterialName: animal.manureData.name,
          ManureTypeName: '1',
          AnnualAmount: animal.manureData.annualLiquidManure,
          AnnualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
          AnnualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
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

  // First check is this action doesn't involve changing the NMPFile
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

  // Everything else sets the NMPFile
  // Remember: all the below steps edit the NMPFile in-place! So functions don't return anything
  const year = newAppState.nmpFile.years.find((y) => y.Year === action.year);
  if (year === undefined) throw new Error(`Reducer received nonexistent year: ${action.year}`);
  if (action.type === 'SAVE_FIELDS') {
    year.Fields = structuredClone(action.newFields);
    // Put each field through the updateCropNutrients function
    year.Fields.forEach((field) => {
      updateCropNutrients(field);
    });
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

  // Save the file to local storage
  saveDataToLocalStorage(NMP_FILE_KEY, newAppState.nmpFile);
  return newAppState;
}
