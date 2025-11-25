/* eslint-disable no-param-reassign */
import {
  calculateCropRequirements,
  postprocessModalData,
} from '@/calculations/FieldAndSoil/Crops/Calculations';
import calculateManureNutrientInputs from '@/calculations/ManureAndCompost/ManureAndImports/Calculations';
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
  NMPFileDerivedManure,
  NMPFileSoilNitrateCredit,
} from '@/types';
import { AppStateTables } from '@/types/AppState';
import { calculateSeparatedSolidAndLiquid } from '@/utils/densityCalculations';
import { saveDataToLocalStorage } from '@/utils/localStorage';
import { calculatePrecipitationInStorage } from '@/utils/manureStorageSystems';
import { getLiquidManureDisplay, getSolidManureDisplay } from '@/utils/utils';
import { calculateAnnualWashWater } from '@/views/AddAnimals/utils';

type CacheTablesAction = {
  type: 'CACHE_TABLES';
  tables: AppStateTables;
};

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
  soilTestsUpdated?: boolean;
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
  | CacheTablesAction
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

/**
 * @param fields The current list of fields containing crops with out-of-sync calculated values
 * @param regionId The value of nmpFile.farmDetails.farmRegion
 * @returns A new, updated list of fields with up-to-date calculated values
 */
function updateFieldCropCalculations(
  fields: NMPFileField[],
  regionId: number,
  tables: AppStateTables,
) {
  return fields.map((field) => {
    const updatedCrops = field.crops.map((crop) => {
      const updatedCropRequirements = calculateCropRequirements(regionId, field, crop, tables);
      // If the crop has a custom N value, it shouldn't be overwritten. The default is still stored separately
      const calculatedN: number = crop.reqNAdjusted
        ? updatedCropRequirements.cropRequirementN
        : undefined;
      return postprocessModalData(
        {
          ...crop,
          reqN: crop.reqNAdjusted ? crop.reqN : updatedCropRequirements.cropRequirementN,
          reqP2o5: updatedCropRequirements.cropRequirementP205,
          reqK2o: updatedCropRequirements.cropRequirementK2O,
          remN: updatedCropRequirements.cropRemovalN,
          remP2o5: updatedCropRequirements.cropRemovalP205,
          remK2o: updatedCropRequirements.cropRemovalK20,
        },
        calculatedN,
      );
    });
    return { ...field, crops: updatedCrops };
  });
}

function updateFieldAppliedManure(
  fields: NMPFileField[],
  nutrientAnalyses: NMPFileNutrientAnalysis[],
  regionId: number,
  tables: AppStateTables,
) {
  const region = tables.regions.find((r) => r.id === regionId);
  if (!region) {
    throw new Error(`No region found with id ${regionId}`);
  }
  const locationId = region.locationid;
  return fields.map((field) => {
    const updatedManures = field.manures.map((manure) => {
      const nutrientAnalysis = nutrientAnalyses.find((n) => n.sourceUuid === manure.sourceUuid);
      const nMineralization = tables.nMineralizations.find(
        (n) =>
          n.locationid === locationId &&
          n.nmineralizationid === nutrientAnalysis?.nMineralizationId,
      );
      const manureTableData = tables.manures.find((m) => m.id === manure.manureId);
      const unitTableData = tables.manureUnits.find((u) => u.id === manure.applUnitId);
      if (!manureTableData || !unitTableData || !nMineralization) {
        throw new Error(
          `updateFieldAppliedManure failed to find necessary data: Region id: ${regionId}. Manure id: ${manure.manureId}. Unit id: ${manure.applUnitId}.`,
        );
      }
      if (!nutrientAnalysis) {
        throw new Error('Applied manure has no corresponding nutrient analysis.');
      }
      const updatedManureNutrients = calculateManureNutrientInputs(
        manureTableData,
        nutrientAnalysis,
        nMineralization,
        manure.applicationRate,
        unitTableData,
        tables.cropConversionFactors,
        manure.nh4Retention,
        manure.nAvailable,
      );
      return {
        ...manure,
        reqN: updatedManureNutrients.N_FirstYear,
        reqP2o5: updatedManureNutrients.P2O5_FirstYear,
        reqK2o: updatedManureNutrients.K2O_FirstYear,
        remN: updatedManureNutrients.N_LongTerm,
        remP2o5: updatedManureNutrients.P2O5_LongTerm,
        remK2o: updatedManureNutrients.K2O_LongTerm,
      };
    });
    return { ...field, manures: updatedManures };
  });
}

function updateStorageSystemPrecipitation(
  storageSystems: NMPFileManureStorageSystem[],
  subregionId: number,
  tables: AppStateTables,
) {
  const subregion = tables.subregions.find((s) => s.id === subregionId);
  if (!subregion) {
    throw new Error(`No region found with id ${subregionId}`);
  }
  return storageSystems.map((system) => ({
    ...system,
    annualPrecipitation: calculatePrecipitationInStorage(system, subregion.annualprecipitation),
  }));
}

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
        if (matchingManure) {
          // Add included manures to system array and set assigned to true
          // NOTE: it is VERY important to take the manure from the new array
          // instead of re-adding the old one as its values may have changed
          matchingManure.assignedToStoredSystem = true; // Edits object in place
          newSystem.push(manure);
        }
      }
    }

    // Add non-empty systems back to the array
    if (newSystem.length > 0) {
      // Solid manure or non-separated liquid don't require other updates
      if (system.manureType !== ManureType.Liquid || !system.percentLiquidSeperation) {
        acc.push({ ...system, manuresInSystem: newSystem });
      } else {
        // The separated amounts need to be recalculated
        const totalAmount = newSystem.reduce((sum, m) => sum + m.data.annualAmount, 0);
        const [separatedLiquidsUSGallons, separatedSolidsTons] = calculateSeparatedSolidAndLiquid(
          totalAmount,
          system.percentLiquidSeperation,
        );
        acc.push({
          ...system,
          manuresInSystem: newSystem,
          separatedLiquidsUSGallons,
          separatedSolidsTons,
        });
      }
    }
    return acc;
  }, [] as NMPFileManureStorageSystem[]);
}

/**
 * Updates derived manures to reflect the latest changes to manure storage systems.
 * If a solid storage system contains a derived manure, that system is also updates.
 * Edits year object in-place.
 * @param newFileYear The NMPFileYear with manure systems up-to-date
 */
function updateDerivedManures(newFileYear: NMPFileYear) {
  const systems = newFileYear.manureStorageSystems;
  if (!systems) {
    newFileYear.derivedManures = undefined;
    return;
  }

  const prevDerivedManures = newFileYear.derivedManures || [];
  const newDerivedManures: NMPFileDerivedManure[] = [];
  for (let i = 0; i < systems.length; i += 1) {
    const system = systems[i];
    // Derived manures can only come from liquid systems
    if (system.manureType !== ManureType.Liquid) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // Any system with separated liquid produces a derived manure
    if (system.separatedLiquidsUSGallons > 0) {
      const prevManure = prevDerivedManures.find((m) => m.originUuid === system.uuid);
      let newManure: NMPFileDerivedManure;
      if (prevManure) {
        // Update the amount
        newManure = {
          ...prevManure,
          annualAmount: system.separatedSolidsTons,
          annualAmountTonsWeight: system.separatedSolidsTons,
        };
      } else {
        // Make a new derived manure
        const name = `Separated solids${newDerivedManures.length > 1 ? ` ${newDerivedManures.length + 1}` : ''}`;
        newManure = {
          uniqueMaterialName: name,
          managedManureName: name,
          manureType: ManureType.Solid,
          annualAmount: system.separatedSolidsTons,
          annualAmountTonsWeight: system.separatedSolidsTons,
          annualAmountUSGallonsVolume: undefined,
          assignedToStoredSystem: false,
          uuid: crypto.randomUUID(),
          originUuid: system.uuid,
        };
      }
      newDerivedManures.push(newManure);
    }
  }
  newFileYear.derivedManures = newDerivedManures;

  // Do a second pass through manure systems to remove deleted manures from storage
  newFileYear.manureStorageSystems = systems.reduce((acc, system) => {
    // The below is a condensed version of the code from updateManureStorageSystems
    const manuresInSystem = system.manuresInSystem.reduce((innerAcc, manure) => {
      if (manure.type !== 'Derived') {
        innerAcc.push(manure);
      } else if (newDerivedManures.some((m) => m.uuid === manure.data.uuid)) {
        innerAcc.push(manure);
      }
      return innerAcc;
    }, [] as ManureInSystem[]);
    if (manuresInSystem.length > 0) {
      acc.push({ ...system, manuresInSystem });
    }
    return acc;
  }, [] as NMPFileManureStorageSystem[]);
}

function updateNutrientAnalyses(
  nutrients: NMPFileNutrientAnalysis[],
  systems: NMPFileManureStorageSystem[],
  generatedManures: NMPFileGeneratedManure[],
  importedManures: NMPFileImportedManure[],
  derivedManures: NMPFileDerivedManure[],
) {
  const allUuids = [
    ...systems.map((s) => s.uuid),
    ...generatedManures.filter((m) => !m.assignedToStoredSystem).map((m) => m.uuid),
    ...importedManures.filter((m) => !m.assignedToStoredSystem).map((m) => m.uuid),
    ...derivedManures.filter((m) => !m.assignedToStoredSystem).map((m) => m.uuid),
  ];
  return nutrients.filter((n) => allUuids.some((uuid) => n.sourceUuid === uuid));
}

function saveAnimals(newFileYear: NMPFileYear, newAnimals: NMPFileAnimal[]) {
  newFileYear.farmAnimals = structuredClone(newAnimals);

  // Update GeneratedManures
  // Each generated manure corresponds to an animal in the list
  const generatedManures: NMPFileGeneratedManure[] = [];
  for (let i = 0; i < newAnimals.length; i += 1) {
    const animal = newAnimals[i];
    if (animal.manureData !== undefined) {
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
        const generatedManure = {
          ...DEFAULT_GENERATED_MANURE,
          uniqueMaterialName: animal.manureData.name,
          manureType: ManureType.Liquid,
          annualAmount: animal.manureData.annualLiquidManure,
          annualAmountUSGallonsVolume: animal.manureData.annualLiquidManure,
          annualAmountDisplayWeight: getLiquidManureDisplay(animal.manureData.annualLiquidManure),
          managedManureName: `${animal.manureData.name}, ${animalStr}, Liquid`,
          uuid: animal.uuid,
        };

        // Milking centre wash water is added into the liquid dairy cow manure
        // Josh said that milking dairy cow manure should always be liquid, but that's never enforced
        if (
          animal.animalId === DAIRY_COW_ID &&
          animal.subtype === MILKING_COW_ID &&
          animal.washWater !== undefined &&
          animal.washWaterUnit !== undefined
        ) {
          // Sum the two values and replace the annual amounts
          generatedManure.originalAnnualAmount = generatedManure.annualAmount;
          generatedManure.originalWashWaterAmount = calculateAnnualWashWater(
            animal.washWater,
            animal.washWaterUnit,
            animal.animalsPerFarm!,
          );
          generatedManure.annualAmount =
            generatedManure.originalAnnualAmount + generatedManure.originalWashWaterAmount;
          generatedManure.annualAmountUSGallonsVolume = generatedManure.annualAmount;
          generatedManure.annualAmountDisplayWeight = getLiquidManureDisplay(
            generatedManure.annualAmount,
          );
        }

        generatedManures.push(generatedManure);
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
  // Update the derived manures with the new storage systems
  updateDerivedManures(newFileYear);
  // Update nutrient analyses with all updated manure/systems
  newFileYear.nutrientAnalyses = updateNutrientAnalyses(
    newFileYear.nutrientAnalyses,
    newFileYear.manureStorageSystems || [],
    generatedManures,
    newFileYear.importedManures || [],
    newFileYear.derivedManures || [],
  );
}

export function updateSoilNitrateCredit(
  fields: NMPFileField[],
  regionLocationId: number,
  currentYear: string,
  tables: AppStateTables,
) {
  const interiorOrExterior = tables.nitrateCredit.find(
    (creditEle) => creditEle.id === regionLocationId,
  );
  if (!interiorOrExterior) {
    throw new Error('Cannot match farmRegion id to nitrate credit data');
  }
  return fields.map((fieldEle) => {
    if (fieldEle.soilTest?.valNO3H) {
      const soilTestDate = new Date(fieldEle.soilTest.sampleDate!);
      const soilTestMonth = soilTestDate.getMonth() + 1;
      const isCurrentYear = soilTestDate.getFullYear().toString() === currentYear;
      const isPreviousYear = (soilTestDate.getFullYear() + 1).toString() === currentYear;

      const newSoilCredit: NMPFileSoilNitrateCredit = {
        name: 'Soil nitrate',
        reqN: Math.round((fieldEle.soilTest.valNO3H * 1.95) / 1.12),
        reqP2o5: 0,
        reqK2o: 0,
        remN: 0,
        remP2o5: 0,
        remK2o: 0,
        isCustomValue: false,
      };

      if (interiorOrExterior.location === 'CoastalBC') {
        // Apply credit if applicable
        if (
          isCurrentYear &&
          interiorOrExterior.fromdatemonth <= soilTestMonth &&
          soilTestMonth <= interiorOrExterior.todatemonth
        ) {
          if (!fieldEle.soilNitrateCredit?.isCustomValue) {
            // Replace with updated value only if value is still applicable but is not custom
            return { ...fieldEle, soilNitrateCredit: newSoilCredit };
          }
          return { ...fieldEle };
        }
        // Delete prior credit if no longer applicable
        return { ...fieldEle, soilNitrateCredit: undefined };
      }
      if (interiorOrExterior.location === 'InteriorBC') {
        // Apply credit if applicable
        if (
          (isPreviousYear && interiorOrExterior.fromdatemonth <= soilTestMonth) ||
          (isCurrentYear && soilTestMonth <= interiorOrExterior.todatemonth)
        ) {
          if (!fieldEle.soilNitrateCredit?.isCustomValue) {
            // Replace with updated value only if value is still applicable but is not custom
            return { ...fieldEle, soilNitrateCredit: newSoilCredit };
          }
          return { ...fieldEle };
        }
        // Delete prior credit if no longer applicable
        return { ...fieldEle, soilNitrateCredit: undefined };
      }
    }
    return { ...fieldEle, soilNitrateCredit: undefined };
  });
}

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  // This should only be called once, during the page load
  if (action.type === 'CACHE_TABLES') {
    const newAppState = {
      nmpFile: structuredClone(state.nmpFile),
      showAnimalsStep: state.showAnimalsStep,
      tables: structuredClone(action.tables),
    };
    return newAppState;
  }

  // In this reducer, we take advantage of JavaScript storing/passing objects as addresses
  // This allows us to clone the state and then edit it in-place
  const newAppState = {
    nmpFile: structuredClone(state.nmpFile),
    showAnimalsStep: state.showAnimalsStep,
    tables: state.tables,
  };

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

  if (!state.tables) {
    throw new Error('Action to edit an NMP file was dispatched before caching tables.');
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

    // When the region or subregion change, any calculations that use the values need to be updated
    if (newAppState.nmpFile.farmDetails.farmRegion !== action.newFarmDetails.farmRegion) {
      const year = newAppState.nmpFile.years[0];
      // First, crop requirement values need to be updated
      year.fields = updateFieldCropCalculations(
        year.fields,
        action.newFarmDetails.farmRegion,
        state.tables,
      );
      // Next, applied manure (from Calculate Nutrients page) need to be updated
      year.fields = updateFieldAppliedManure(
        year.fields,
        year.nutrientAnalyses,
        action.newFarmDetails.farmRegion,
        state.tables,
      );
      // Then, update soil nitrate credit
      year.fields = updateSoilNitrateCredit(
        year.fields,
        action.newFarmDetails.regionLocationId,
        year.year,
        state.tables,
      );
    }
    if (
      newAppState.nmpFile.farmDetails.farmSubregion !== action.newFarmDetails.farmSubregion &&
      action.newFarmDetails.farmSubregion &&
      newAppState.nmpFile.years[0].manureStorageSystems
    ) {
      // Update precipitation-related values
      const year = newAppState.nmpFile.years[0];
      year.manureStorageSystems = updateStorageSystemPrecipitation(
        year.manureStorageSystems!,
        action.newFarmDetails.farmSubregion,
        state.tables,
      );
    }

    newAppState.nmpFile.farmDetails = structuredClone(action.newFarmDetails);
    saveDataToLocalStorage(APP_STATE_KEY, newAppState);
    return newAppState;
  }

  // These actions alter one index of the NMPFile years array
  // Remember: some functions below edit the NMPFile in-place and don't return anything
  const year = newAppState.nmpFile.years.find((y) => y.year === action.year);
  if (year === undefined) throw new Error(`Reducer received nonexistent year: ${action.year}`);
  if (action.type === 'SAVE_FIELDS') {
    if (action.soilTestsUpdated) {
      year.fields = updateFieldCropCalculations(
        action.newFields,
        state.nmpFile.farmDetails.farmRegion,
        state.tables,
      );
      year.fields = updateSoilNitrateCredit(
        year.fields,
        newAppState.nmpFile.farmDetails.regionLocationId,
        year.year,
        state.tables,
      );
    } else {
      year.fields = structuredClone(action.newFields);
    }
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
      year.derivedManures || [],
    );
  } else if (action.type === 'SAVE_MANURE_STORAGE_SYSTEMS') {
    year.manureStorageSystems = structuredClone(action.newManureStorageSystems);

    // Update the derived manures to reflect the new storage systems
    updateDerivedManures(year);

    // Update the 'assignedToStoredSystem' attr of all manures
    // First, unassign all manures from a system
    const newImportedManures = (year.importedManures || []).map((m) => ({
      ...m,
      assignedToStoredSystem: false,
    }));
    const newGeneratedManures = (year.generatedManures || []).map((m) => ({
      ...m,
      assignedToStoredSystem: false,
    }));
    const newDerivedManures = (year.derivedManures || []).map((m) => ({
      ...m,
      assignedToStoredSystem: false,
    }));
    // Next, go through each system and set corresponding manures to assigned
    year.manureStorageSystems.forEach((system) => {
      system.manuresInSystem.forEach((manure) => {
        // TODO: Maybe use uuid instead here? Don't think that existed when first implemented
        if (manure.type === 'Imported') {
          const matchingManure = newImportedManures.find(
            (m) => m.managedManureName === manure.data.managedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No imported manure found with name ${manure.data.managedManureName}`);
          }
          matchingManure.assignedToStoredSystem = true;
        } else if (manure.type === 'Generated') {
          const matchingManure = newGeneratedManures.find(
            (m) => m.managedManureName === manure.data.managedManureName,
          );
          if (!matchingManure) {
            throw new Error(`No generated manure found with name ${manure.data.managedManureName}`);
          }
          matchingManure.assignedToStoredSystem = true;
        } else {
          const matchingManure = newDerivedManures.find((m) => m.uuid === manure.data.uuid);
          if (!matchingManure) {
            throw new Error(`No derived manure found with uuid ${manure.data.uuid}`);
          }
          matchingManure.assignedToStoredSystem = true;
        }
      });
    });
    year.generatedManures = newGeneratedManures;
    year.importedManures = newImportedManures;
    year.derivedManures = newDerivedManures;

    year.nutrientAnalyses = updateNutrientAnalyses(
      year.nutrientAnalyses,
      year.manureStorageSystems,
      newGeneratedManures,
      newImportedManures,
      newDerivedManures,
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
    // Update derived manures with new systems
    updateDerivedManures(year);
    // Update nutrient analyses to remove generated manures
    year.nutrientAnalyses = updateNutrientAnalyses(
      year.nutrientAnalyses,
      year.manureStorageSystems || [],
      [],
      year.importedManures || [],
      year.derivedManures || [],
    );
  }

  // Save the file to local storage
  saveDataToLocalStorage(APP_STATE_KEY, newAppState);
  return newAppState;
}
