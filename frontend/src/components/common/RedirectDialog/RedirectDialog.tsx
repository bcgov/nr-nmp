import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppState from '@/hooks/useAppState';
import { LANDING_PAGE } from '@/constants/routes';
import AlertDialog from '../AlertDialog/AlertDialog';

export default function RedirectDialog(
  props: {isOpen: boolean, onOpenChange: (isOpen: boolean) => void, downloadFile: () => void},
) {
  const { isOpen, onOpenChange, downloadFile } = props;
  const { dispatch } = useAppState();
  const navigate = useNavigate();
  const [downloadClicked, setDownloadClicked] = useState<boolean>(false);

  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={(b) => onOpenChange(b)}
      title="Warning - Unsaved Data"
      closeBtn={{ hide: downloadClicked }}
      extraBtn={downloadClicked ? undefined : {
        variant: 'primary',
        btnText: 'Download file',
        handleClick: () => {
          downloadFile();
          setDownloadClicked(true);
        },
      }}
      continueBtn={{ handleClick: () => {
        dispatch({ type: 'RESET_NMPFILE' });
        navigate(LANDING_PAGE);
      } }}
    >
      <div style={{ color: 'red' }}>
        <b>Download file</b>
        {' '}
        to save the changes you made, or
        {' '}
        <b>Continue</b>
        {' '}
        without saving.
      </div>
    </AlertDialog>
  );
}
