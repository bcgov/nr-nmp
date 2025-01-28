import CropData from '@/types/NMPFileCropData';

const defaultNMPFileCropsData: CropData = {
  id: 0,
  cropId: '',
  cropTypeId: 0,
  cropOther: null,
  yield: 0,
  reqN: 0,
  stdN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
  crudeProtien: 0,
  prevCropId: 0,
  coverCropHarvested: null,
  prevYearManureAppl_volCatCd: 0,
  yieldHarvestUnit: 0,
  yieldByHarvestUnit: 0,
  plantAgeYears: null,
  numberOfPlantsPerAcre: 0,
  distanceBtwnPlantsRows: null,
  willPlantsBePruned: false,
  whereWillPruningsGo: null,
  willSawdustBeApplied: false,
};

export default defaultNMPFileCropsData;
