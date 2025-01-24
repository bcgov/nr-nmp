interface CropData {
  coverCropHarvested: null | string;
  cropTypeId?: string;
  cropId: string;
  cropOther: null | string;
  crudeProtien: null | string;
  distanceBtwnPlantsRows: null | string;
  id: null | string;
  numberOfPlantsPerAcre: null | number;
  plantAgeYears: null | number;
  prevCropId: null | string;
  prevYearManureAppl_volCatCd: null | string;
  remK2o: null | number;
  remN: null | number;
  remP2o5: null | number;
  reqK2o: null | number;
  reqN: null | number;
  reqP2o5: null | number;
  stdN: null | number;
  whereWillPruningsGo: null | string;
  willPlantsBePruned: boolean;
  willSawdustBeApplied: boolean;
  yield: null | number;
  yieldByHarvestUnit: null | number;
  yieldHarvestUnit: null | number;
}

export default CropData;
