/* eslint-disable no-case-declarations */
import { HarvestUnit } from '@/constants';
import { CropType, NMPFileCropData } from '@/types';
import { Crop, CROP_OTHER_ID, CROP_TYPE_OTHER_ID, GRAIN_OILSEED_ID } from '@/types/Crops';
import { CROP_TYPE_BERRIES_ID } from '../../types/Crops';

export function showUnitDropdown(cropTypeId: number) {
  return cropTypeId === GRAIN_OILSEED_ID;
}

export type CropsModalState = {
  formData: NMPFileCropData;
  selectedCropType?: CropType;
  selectedCrop?: Crop;
  defaultYieldInTons?: number;
  // isFormYieldEqualToDefault inits to true to hide a button
  isFormYieldEqualToDefault: boolean;
};

type SetCropTypeIdAction = {
  type: 'SET_CROP_TYPE_ID';
  cropTypeId: number;
  cropType: CropType;
};

type SetCropIdAction = {
  type: 'SET_CROP_ID';
  cropId: number;
  crop: Crop;
};

type SetYieldAction = {
  type: 'SET_YIELD';
  yield: number;
};

type SetYieldInTonsAction = {
  type: 'SET_YIELD_IN_TONS';
  yield: number;
};

type SetYieldHarvestUnit = {
  type: 'SET_YIELD_HARVEST_UNIT';
  unit: HarvestUnit;
};

type SetCalculatedValuesAction = {
  type: 'SET_CALCULATED_VALUES';
  reqN: number;
  reqP2o5: number;
  reqK2o: number;
  remN: number;
  remP2o5: number;
  remK2o: number;
};

type SetFormDataAttrAction = {
  type: 'SET_FORM_DATA_ATTR';
  attr: keyof NMPFileCropData;
  value: string | number | boolean;
};

type SetSelectedCropTypeAction = {
  type: 'SET_SELECTED_CROP_TYPE';
  cropType: CropType;
};

type SetSelectedCropAction = {
  type: 'SET_SELECTED_CROP';
  crop: Crop;
};

type SetDefaultYieldAction = {
  type: 'SET_DEFAULT_YIELD';
  amount: number;
};

type RestoreDefaultYieldAction = {
  type: 'RESTORE_DEFAULT_YIELD';
};

export type CropsModalReducerAction =
  | SetCropTypeIdAction
  | SetCropIdAction
  | SetYieldAction
  | SetYieldInTonsAction
  | SetYieldHarvestUnit
  | SetCalculatedValuesAction
  | SetFormDataAttrAction
  | SetSelectedCropTypeAction
  | SetSelectedCropAction
  | SetDefaultYieldAction
  | RestoreDefaultYieldAction;

function isCropSet(cropId: number, selectedCrop?: Crop) {
  if (cropId === 0) return false;
  // If cropId is non-zero, selectedCrop should match it
  if (cropId !== CROP_OTHER_ID && (selectedCrop === undefined || cropId !== selectedCrop.id)) {
    throw new Error('Crops modal entered bad state');
  }
  return true;
}

function validateBushelConversion(selectedCrop?: Crop) {
  if (!selectedCrop?.harvestbushelsperton) {
    throw new Error('Crops modal entered bad state');
  }
}

function compareYieldToDefaultYield(
  Yield: number, // using caps to dodge restricted term
  defaultYieldInTons: number | undefined,
  yieldHarvestUnit: string | undefined,
  cropId: number,
  selectedCrop: Crop | undefined,
) {
  // Default to true to hide reset button
  if (
    defaultYieldInTons === undefined ||
    cropId === CROP_OTHER_ID ||
    !isCropSet(cropId, selectedCrop)
  ) {
    return true;
  }

  if (yieldHarvestUnit !== undefined) {
    validateBushelConversion(selectedCrop);
    return yieldHarvestUnit === HarvestUnit.BushelsPerAcre
      ? Yield === defaultYieldInTons * selectedCrop!.harvestbushelsperton
      : Yield === defaultYieldInTons;
  }
  return Yield === defaultYieldInTons;
}

export function cropsModalReducer(
  state: CropsModalState,
  action: CropsModalReducerAction,
): CropsModalState {
  const { formData, selectedCrop, defaultYieldInTons } = state;
  switch (action.type) {
    case 'SET_CROP_TYPE_ID':
      return {
        ...state,
        selectedCropType: action.cropType,
        formData: {
          ...formData,
          cropTypeId: action.cropTypeId,
          // Special case #1: if this is a cover crop, default coverCropHarvested to false, otherwise clear it
          coverCropHarvested: action.cropType.covercrop
            ? formData.coverCropHarvested === undefined
              ? false
              : formData.coverCropHarvested
            : undefined,
          // Special case #2: if this is the Other crop type, set the crop id to Other, otherwise reset crop id
          cropId: action.cropTypeId === CROP_TYPE_OTHER_ID ? CROP_OTHER_ID : 0,
          // Special case #3: if this crop type shows the unit dropdown, set yieldHarvestUnit to bu/ac, otherwise clear it
          yieldHarvestUnit: showUnitDropdown(action.cropTypeId)
            ? HarvestUnit.BushelsPerAcre
            : undefined,
          // Special case #4: if this is Berry, set berry fields to default, otherwise set to undefined
          willSawdustBeApplied: action.cropTypeId === CROP_TYPE_BERRIES_ID ? false : undefined,
          willPlantsBePruned: action.cropTypeId === CROP_TYPE_BERRIES_ID ? false : undefined,
          // These berry fields have a default value of undefined
          plantAgeYears: undefined,
          numberOfPlantsPerAcre: undefined,
          distanceBtwnPlantsRows: undefined,
          whereWillPruningsGo: undefined,
        },
        selectedCrop: undefined,
        defaultYieldInTons: undefined,
      };

    case 'SET_CROP_ID':
      // TODO: Make these into constants once you know what "unitConversionFactor" means. There's gotta be a better name
      const nToProteinConversionFactor = 0.625;
      const unitConversionFactor = 0.5;

      return {
        ...state,
        selectedCrop: action.crop,
        formData: {
          ...formData,
          cropId: action.cropId,
          name: action.crop.cropname,
          crudeProtein:
            action.crop.nitrogenrecommendationid !== null // NOTE: I don't see anywhere in the data where this is null
              ? action.crop.cropremovalfactornitrogen *
                nToProteinConversionFactor *
                unitConversionFactor
              : formData.crudeProtein,
        },
      };

    case 'SET_YIELD':
      return {
        ...state,
        formData: { ...formData, yield: action.yield },
        isFormYieldEqualToDefault: compareYieldToDefaultYield(
          action.yield,
          defaultYieldInTons,
          formData.yieldHarvestUnit,
          formData.cropId,
          selectedCrop,
        ),
      };

    case 'SET_YIELD_IN_TONS':
      if (isCropSet(formData.cropId, selectedCrop) && formData.yieldHarvestUnit !== undefined) {
        validateBushelConversion(selectedCrop);
        return {
          ...state,
          formData: {
            ...formData,
            yield:
              formData.yieldHarvestUnit === HarvestUnit.BushelsPerAcre
                ? action.yield * selectedCrop!.harvestbushelsperton
                : action.yield,
          },
          isFormYieldEqualToDefault: action.yield === defaultYieldInTons,
        };
      }
      return {
        ...state,
        formData: { ...formData, yield: action.yield },
        // Default to true to hide button
        isFormYieldEqualToDefault:
          defaultYieldInTons !== undefined ? action.yield === defaultYieldInTons : true,
      };

    case 'SET_YIELD_HARVEST_UNIT':
      if (formData.yieldHarvestUnit === action.unit) {
        // Shouldn't occur, but return without making changes
        return state;
      }
      // Don't change yield if the crop isn't set
      if (!isCropSet(formData.cropId, selectedCrop)) {
        return {
          ...state,
          formData: {
            ...formData,
            yieldHarvestUnit: action.unit,
          },
        };
      }

      validateBushelConversion(selectedCrop);
      return {
        ...state,
        formData: {
          ...formData,
          yieldHarvestUnit: action.unit,
          yield:
            action.unit === HarvestUnit.TonsPerAcre
              ? // Going from bu/ac to tons/ac
                formData.yield / selectedCrop!.harvestbushelsperton
              : // Going from tons/ac to bu/ac
                formData.yield * selectedCrop!.harvestbushelsperton,
        },
      };

    case 'SET_CALCULATED_VALUES':
      return {
        ...state,
        formData: {
          ...formData,
          reqN: action.reqN,
          reqP2o5: action.reqP2o5,
          reqK2o: action.reqK2o,
          remN: action.remN,
          remP2o5: action.remP2o5,
          remK2o: action.remK2o,
        },
      };

    case 'SET_FORM_DATA_ATTR':
      return {
        ...state,
        formData: {
          ...formData,
          [action.attr]: action.value,
        },
      };

    case 'SET_SELECTED_CROP_TYPE':
      return { ...state, selectedCropType: action.cropType };

    case 'SET_SELECTED_CROP':
      return { ...state, selectedCrop: action.crop };

    case 'SET_DEFAULT_YIELD':
      return {
        ...state,
        defaultYieldInTons: action.amount,
        isFormYieldEqualToDefault:
          formData.yield === undefined
            ? true
            : compareYieldToDefaultYield(
                formData.yield,
                action.amount,
                formData.yieldHarvestUnit,
                formData.cropId,
                selectedCrop,
              ),
      };

    case 'RESTORE_DEFAULT_YIELD':
      if (defaultYieldInTons === undefined || !isCropSet(formData.cropId, selectedCrop)) {
        throw new Error('Crops modal entered bad state');
      }
      if (formData.yieldHarvestUnit !== undefined) {
        validateBushelConversion(selectedCrop);
        return {
          ...state,
          isFormYieldEqualToDefault: true,
          formData: {
            ...formData,
            yield:
              formData.yieldHarvestUnit === HarvestUnit.BushelsPerAcre
                ? defaultYieldInTons * selectedCrop!.harvestbushelsperton
                : defaultYieldInTons,
          },
        };
      }
      return {
        ...state,
        isFormYieldEqualToDefault: true,
        formData: { ...formData, yield: defaultYieldInTons },
      };

    default:
      return state;
  }
}
