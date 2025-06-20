import { NMPFileCropData } from '@/types';

const DEFAULT_NMPFILE_CROPS: Omit<NMPFileCropData, 'index'> = {
  cropId: '',
  cropTypeId: 0,
  cropName: '',
  cropTypeName: '',
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
};

export default DEFAULT_NMPFILE_CROPS;
