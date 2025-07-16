/* eslint-disable no-param-reassign */
import { DEFAULT_NMPFILE, DEFAULT_NMPFILE_YEAR, APP_STATE_KEY } from '@/constants';
import DefaultGeneratedManureFormData from '@/constants/DefaultGeneratedManureData';
import {
  NMPFileFieldData,
  NMPFileFarmManureData,
  NMPFileImportedManureData,
  NMPFileManureStorageSystem,
  AnimalData,
  NMPFileYear,
  DAIRY_COW_ID,
  MILKING_COW_ID,
  NMPFileGeneratedManureData,
  AppState,
  NMPFile,
  NMPFileFarmDetails,
  ManureType,
} from '@/types';
import { saveDataToLocalStorage } from '@/utils/localStorage';
import { getLiquidManureDisplay, getSolidManureDisplay } from '@/utils/utils';
import { ManureInSystem } from '../../types/NMPFileManureStorageSystem';

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

type SaveManureStorageSystemsAction = {
  type: 'SAVE_MANURE_STORAGE_SYSTEMS';
  year: string;
  newManureStorageSystems: NMPFileManureStorageSystem[];
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
  | SaveManureStorageSystemsAction
  | SaveAnimalsAction
  | ClearAnimalsAction
  | OverwriteNMPFileAction
  | ResetNMPFileAction;

function updateManureStorageSystems(
  systems: NMPFileManureStorageSystem[],
  type: 'Generated' | 'Imported',
  newManures: NMPFileGeneratedManureData[] | NMPFileImportedManureData[],
) {
  // First, unassign all manures from a system (this edits the objects in place)
  newManures.forEach((manure) => {
    manure.AssignedToStoredSystem = false;
  });

  return systems.reduce((acc, system) => {
    // Remove any manures of the same type from a system that aren't included in the new array
    const newSystem: ManureInSystem[] = [];
    for (let i = 0; i < system.manuresInSystem.length; i += 1) {
      const manure: ManureInSystem = system.manuresInSystem[i];
      if (manure.type !== type) {
        newSystem.push(manure);
      } else {
        const matchingManure = newManures.find(
          (m) => m.ManagedManureName === manure.data.ManagedManureName,
        );
        // Add included manures to system array and set assigned to true
        if (matchingManure) {
          matchingManure.AssignedToStoredSystem = true; // Edits object in place
          newSystem.push(manure);
        }
      }
    }

    // Add non-empty systems back to the array
    if (newSystem.length > 0) {
      acc.push({ ...system, manuresInSystem: newSystem });
    }
    return acc;
  }, [] as NMPFileManureStorageSystem[]);
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
          UniqueMaterialName: animal.manureData.name,
          ManureType: ManureType.Solid,
          AnnualAmount: animal.manureData.annualSolidManure,
          AnnualAmountTonsWeight: animal.manureData.annualSolidManure,
          AnnualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
          // ManagedManureName is the name of the manure, number of animals and manure type
          // Calves (0 to 3 months old), 2 animals, Solid
          ManagedManureName: `${animal.manureData.name}, ${animal.animalsPerFarm} animal${animal.animalsPerFarm === 1 ? '' : 's'}, Solid`,
        });
      } else {
        generatedManures.push({
          ...DefaultGeneratedManureFormData,
          UniqueMaterialName: animal.manureData.name,
          ManureType: ManureType.Liquid,
          AnnualAmount: animal.manureData.annualLiquidManure,
          AnnualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
          AnnualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          ManagedManureName: `${animal.manureData.name}, ${animal.animalsPerFarm} animal${animal.animalsPerFarm === 1 ? '' : 's'}, Liquid`,
        });
      }
    }
  }
  newFileYear.GeneratedManures = generatedManures;

  if (newFileYear.ManureStorageSystems) {
    newFileYear.ManureStorageSystems = updateManureStorageSystems(
      newFileYear.ManureStorageSystems,
      'Generated',
      generatedManures,
    );
  }
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
    saveDataToLocalStorage(APP_STATE_KEY, newAppState);
    return newAppState;
  }

  if (action.type === 'RESET_NMPFILE') {
    newAppState.nmpFile = structuredClone(DEFAULT_NMPFILE);
    saveDataToLocalStorage(APP_STATE_KEY, newAppState);
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
    saveDataToLocalStorage(APP_STATE_KEY, newAppState);
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
    if (year.ManureStorageSystems) {
      year.ManureStorageSystems = updateManureStorageSystems(
        year.ManureStorageSystems,
        'Imported',
        action.newManures,
      );
    }
  } else if (action.type === 'SAVE_MANURE_STORAGE_SYSTEMS') {
    year.ManureStorageSystems = structuredClone(action.newManureStorageSystems);

    // Update the generated and imported manure lists
    // First, unassign all manures from a system
    const newImportedManures = (year.ImportedManures || []).map((m) => ({
      ...m,
      AssignedToStoredSystem: false,
    }));
    const newGeneratedManures = (year.GeneratedManures || []).map((m) => ({
      ...m,
      AssignedToStoredSystem: false,
    }));
    // Next, go through each system and alter the corresponding manures
    year.ManureStorageSystems.forEach((system) => {
      system.manuresInSystem.forEach((manure) => {
        if (manure.type === 'Imported') {
          const matchingManure = newImportedManures.find(
            (m) => m.ManagedManureName === manure.data.ManagedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No imported manure found with name ${manure.data.ManagedManureName}`);
          }
          matchingManure.AssignedToStoredSystem = true;
        } else {
          const matchingManure = newGeneratedManures.find(
            (m) => m.ManagedManureName === manure.data.ManagedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No generated manure found with name ${manure.data.ManagedManureName}`);
          }
          matchingManure.AssignedToStoredSystem = true;
        }
      });
    });
    year.GeneratedManures = newGeneratedManures;
    year.ImportedManures = newImportedManures;
  } else if (action.type === 'SAVE_ANIMALS') {
    saveAnimals(year, action.newAnimals);
  } else if (action.type === 'CLEAR_ANIMALS') {
    year.FarmAnimals = undefined;
    year.GeneratedManures = undefined;
    if (year.ManureStorageSystems) {
      year.ManureStorageSystems = updateManureStorageSystems(
        year.ManureStorageSystems,
        'Generated',
        [],
      );
    }
  }

  // Save the file to local storage
  saveDataToLocalStorage(APP_STATE_KEY, newAppState);
  return newAppState;
}
