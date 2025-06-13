import { Button } from '@bcgov/design-system-react-components';
import { StyledContent } from './reporting.styles';
import { AppTitle, PageTitle, ProgressStepper } from '../../components/common';

import useAppService from '@/services/app/useAppService';

export default function FieldList() {
  const { state } = useAppService(); // setNMPFile

  return (
    <StyledContent>
      <ProgressStepper />
      <AppTitle />
      <PageTitle title="Reporting" />

      <div>
        <Button>Complete report</Button>
        <Button>Record keeping sheets</Button>
      </div>
      <div>
        <div>To continue later, Download file to your computer</div>
        <div>Load a file on the Home page when you want to continue</div>
        <a href="_blank">How to use the data file</a>

        <Button>Download file</Button>
      </div>
      <div>{JSON.stringify(state, null, 2)}</div>
    </StyledContent>
  );
}
