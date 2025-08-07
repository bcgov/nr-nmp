import { NMPFileCropData } from '@/types';

const DEFAULT_NMPFILE_CROPS: NMPFileCropData = {
  cropId: 0,
  cropTypeId: 0,
  name: '',
  yield: 0,
  reqN: 0,
  reqP2o5: 0,
  reqK2o: 0,
  remN: 0,
  remP2o5: 0,
  remK2o: 0,
  nCredit: 0,
  hasLeafTest: false,
  leafTissueP: undefined, // Needs to be undefined
  leafTissueK: undefined, // Needs to be undefined
};

export default DEFAULT_NMPFILE_CROPS;
