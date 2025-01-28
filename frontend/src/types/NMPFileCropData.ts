interface NMPFileCropData {
  id?: number;
  cropId?: string;
  cropTypeId?: number;
  cropOther?: string | null;
  yield?: number;
  reqN?: number;
  stdN?: number;
  reqP2o5?: number;
  reqK2o?: number;
  remN?: number;
  remP2o5?: number;
  remK2o?: number;
  crudeProtien?: number;
  prevCropId?: number;
  coverCropHarvested?: string | null;
  prevYearManureAppl_volCatCd?: number;
  yieldHarvestUnit?: number;
  yieldByHarvestUnit?: number;
  plantAgeYears?: number | null;
  numberOfPlantsPerAcre?: number;
  distanceBtwnPlantsRows?: number | null;
  willPlantsBePruned?: boolean;
  whereWillPruningsGo?: string | null;
  willSawdustBeApplied?: boolean;
}

export default NMPFileCropData;
