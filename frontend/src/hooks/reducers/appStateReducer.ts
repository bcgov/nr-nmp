/* eslint-disable no-param-reassign */
import {
  DEFAULT_NMPFILE,
  DEFAULT_NMPFILE_YEAR,
  APP_STATE_KEY,
  DAIRY_COW_ID,
  MILKING_COW_ID,
  POULTRY_ID,
  DEFAULT_GENERATED_MANURE,
} from '@/constants';
import {
  NMPFileField,
  NMPFileImportedManure,
  NMPFileManureStorageSystem,
  NMPFileAnimal,
  NMPFileYear,
  NMPFileGeneratedManure,
  AppState,
  NMPFile,
  NMPFileFarmDetails,
  ManureType,
  NMPFileNutrientAnalysis,
  ManureInSystem,
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
  newFields: NMPFileField[];
};

type SaveNutrientAnalysisAction = {
  type: 'SAVE_NUTRIENT_ANALYSIS';
  year: string;
  newNutrientAnalyses: NMPFileNutrientAnalysis[];
};

type SaveImportedManureAction = {
  type: 'SAVE_IMPORTED_MANURE';
  year: string;
  newManures: NMPFileImportedManure[];
};

type SaveManureStorageSystemsAction = {
  type: 'SAVE_MANURE_STORAGE_SYSTEMS';
  year: string;
  newManureStorageSystems: NMPFileManureStorageSystem[];
};

type SaveAnimalsAction = {
  type: 'SAVE_ANIMALS';
  year: string;
  newAnimals: NMPFileAnimal[];
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
  | SaveNutrientAnalysisAction
  | SaveImportedManureAction
  | SaveManureStorageSystemsAction
  | SaveAnimalsAction
  | ClearAnimalsAction
  | OverwriteNMPFileAction
  | ResetNMPFileAction;

function updateManureStorageSystems(
  systems: NMPFileManureStorageSystem[],
  type: 'Generated' | 'Imported',
  newManures: NMPFileGeneratedManure[] | NMPFileImportedManure[],
) {
  // First, unassign all manures from a system (this edits the objects in place)
  newManures.forEach((manure) => {
    manure.assignedToStoredSystem = false;
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
          (m) => m.managedManureName === manure.data.managedManureName,
        );
        // Add included manures to system array and set assigned to true
        if (matchingManure) {
          matchingManure.assignedToStoredSystem = true; // Edits object in place
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

function updateNutrientAnalyses(
  nutrients: NMPFileNutrientAnalysis[],
  systems: NMPFileManureStorageSystem[],
  generatedManures: NMPFileGeneratedManure[],
  importedManures: NMPFileImportedManure[],
) {
  const allUuids = [
    ...systems.map((s) => s.uuid),
    ...generatedManures.filter((m) => !m.isMaterialStored).map((m) => m.uuid),
    ...importedManures.filter((m) => !m.isMaterialStored).map((m) => m.uuid),
  ];
  return nutrients.filter((n) => allUuids.some((uuid) => n.sourceUuid === uuid));
}

function saveAnimals(newFileYear: NMPFileYear, newAnimals: NMPFileAnimal[]) {
  newFileYear.farmAnimals = structuredClone(newAnimals);

  // Update GeneratedManures
  const generatedManures: NMPFileGeneratedManure[] = [];
  for (let i = 0; i < newAnimals.length; i += 1) {
    const animal = newAnimals[i];
    if (animal.manureData !== undefined) {
      if (animal.animalId === DAIRY_COW_ID && animal.subtype === MILKING_COW_ID) {
        // TODO: Add wash water as manure. We're ignoring a lot of dairy cow stuff for now
      }

      let animalStr;
      if (animal.animalId === POULTRY_ID) {
        animalStr = `${animal.flocksPerYear} flock${animal.flocksPerYear === 1 ? '' : 's'}`;
      } else {
        animalStr = `${animal.animalsPerFarm} animal${animal.animalsPerFarm === 1 ? '' : 's'}`;
      }
      if (animal.manureData.annualSolidManure !== undefined) {
        generatedManures.push({
          ...DEFAULT_GENERATED_MANURE,
          uniqueMaterialName: animal.manureData.name,
          manureType: ManureType.Solid,
          annualAmount: animal.manureData.annualSolidManure,
          annualAmountTonsWeight: animal.manureData.annualSolidManure,
          annualAmountDisplayWeight: getSolidManureDisplay(animal.manureData.annualSolidManure),
          // managedManureName is the name of the manure, number of animals and manure type
          // Calves (0 to 3 months old), 2 animals, Solid
          managedManureName: `${animal.manureData.name}, ${animalStr}, Solid`,
          // Link the generated manure to the animal that created it
          uuid: animal.uuid,
        });
      } else {
        generatedManures.push({
          ...DEFAULT_GENERATED_MANURE,
          uniqueMaterialName: animal.manureData.name,
          manureType: ManureType.Liquid,
          annualAmount: animal.manureData.annualLiquidManure,
          annualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
          annualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          managedManureName: `${animal.manureData.name}, ${animalStr}, Liquid`,
          uuid: animal.uuid,
        });
      }
    }
  }
  newFileYear.generatedManures = generatedManures;

  // Update storage systems with new generated manures
  if (newFileYear.manureStorageSystems) {
    newFileYear.manureStorageSystems = updateManureStorageSystems(
      newFileYear.manureStorageSystems,
      'Generated',
      generatedManures,
    );
  }
  // Update nutrient analyses with new generated manures
  newFileYear.nutrientAnalyses = updateNutrientAnalyses(
    newFileYear.nutrientAnalyses,
    newFileYear.manureStorageSystems || [],
    generatedManures,
    newFileYear.importedManures || [],
  );
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
      action.newFarmDetails.year !== newAppState.nmpFile.years[0].year
    ) {
      newAppState.nmpFile.years = [{ ...DEFAULT_NMPFILE_YEAR, year: action.newFarmDetails.year }];
      // Otherwise, keep the existing year and edit as necessary
    } else if (
      action.newFarmDetails.farmAnimals === undefined ||
      action.newFarmDetails.farmAnimals.length === 0
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
  const year = newAppState.nmpFile.years.find((y) => y.year === action.year);
  if (year === undefined) throw new Error(`Reducer received nonexistent year: ${action.year}`);
  if (action.type === 'SAVE_FIELDS') {
    year.fields = structuredClone(action.newFields);
  } else if (action.type === 'SAVE_NUTRIENT_ANALYSIS') {
    year.nutrientAnalyses = structuredClone(action.newNutrientAnalyses);
  } else if (action.type === 'SAVE_IMPORTED_MANURE') {
    year.importedManures = structuredClone(action.newManures);

    if (year.manureStorageSystems) {
      year.manureStorageSystems = updateManureStorageSystems(
        year.manureStorageSystems,
        'Imported',
        action.newManures,
      );
    }
    // Update nutrient analyses with new imported manures
    year.nutrientAnalyses = updateNutrientAnalyses(
      year.nutrientAnalyses,
      year.manureStorageSystems || [],
      year.generatedManures || [],
      action.newManures,
    );
  } else if (action.type === 'SAVE_MANURE_STORAGE_SYSTEMS') {
    year.manureStorageSystems = structuredClone(action.newManureStorageSystems);

    // Update the generated and imported manure lists
    // First, unassign all manures from a system
    const newImportedManures = (year.importedManures || []).map((m) => ({
      ...m,
      assignedToStoredSystem: false,
    }));
    const newGeneratedManures = (year.generatedManures || []).map((m) => ({
      ...m,
      assignedToStoredSystem: false,
    }));
    // Next, go through each system and alter the corresponding manures
    year.manureStorageSystems.forEach((system) => {
      system.manuresInSystem.forEach((manure) => {
        if (manure.type === 'Imported') {
          const matchingManure = newImportedManures.find(
            (m) => m.managedManureName === manure.data.managedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No imported manure found with name ${manure.data.managedManureName}`);
          }
          matchingManure.assignedToStoredSystem = true;
        } else {
          const matchingManure = newGeneratedManures.find(
            (m) => m.managedManureName === manure.data.managedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No generated manure found with name ${manure.data.managedManureName}`);
          }
          matchingManure.assignedToStoredSystem = true;
        }
      });
    });
    year.generatedManures = newGeneratedManures;
    year.importedManures = newImportedManures;

    year.nutrientAnalyses = updateNutrientAnalyses(
      year.nutrientAnalyses,
      year.manureStorageSystems,
      newGeneratedManures,
      newImportedManures,
    );
  } else if (action.type === 'SAVE_ANIMALS') {
    saveAnimals(year, action.newAnimals);
  } else if (action.type === 'CLEAR_ANIMALS') {
    year.farmAnimals = undefined;
    year.generatedManures = undefined;
    // Update storage systems to remove generated manures
    if (year.manureStorageSystems) {
      year.manureStorageSystems = updateManureStorageSystems(
        year.manureStorageSystems,
        'Generated',
        [],
      );
    }
    // Update nutrient analyses to remove generated manures
    year.nutrientAnalyses = updateNutrientAnalyses(
      year.nutrientAnalyses,
      year.manureStorageSystems || [],
      [],
      year.importedManures || [],
    );
  }
  // Save the file to local storage
  saveDataToLocalStorage(APP_STATE_KEY, newAppState);
  return newAppState;
}
