import React from 'react';
import {
  Button,
  Dialog,
  Modal as BcGovModal,
  ButtonGroup,
} from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children?: React.ReactNode;
  closeBtn?: {
    btnText?: string;
    handleClick?: () => void;
    variant?: 'link' | 'secondary' | 'primary' | 'tertiary' | undefined;
  };
  extraBtn?: {
    btnText: string;
    handleClick: () => void;
    variant: 'link' | 'secondary' | 'primary' | 'tertiary' | undefined;
  };
  continueBtn?: {
    btnText?: string;
    handleClick: () => void;
    variant?: 'link' | 'secondary' | 'primary' | 'tertiary' | undefined;
  };
  modalStyle?: React.CSSProperties;
}

function AlertDialog({
  isOpen,
  onOpenChange,
  title,
  children,
  closeBtn,
  continueBtn,
  extraBtn,
  modalStyle,
}: ModalProps) {
  const handleClose = (modalState: boolean = false) => {
    onOpenChange(modalState);
  };
  return (
    <BcGovModal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      style={{ ...modalStyle, border: '0px', outline: 'none' }}
    >
      <Dialog
        isCloseable
        role="dialog"
        aria-label={title}
      >
        <div>
          <div
            style={{
              padding: '1rem',
              fontWeight: '700',
              fontSize: '1rem',
            }}
          >
            {title}
          </div>
          <Divider
            aria-hidden="true"
            component="div"
            css={{ marginBottom: '0.5rem' }}
          />
          <div style={{ padding: '1rem' }}>{children}</div>
          <Divider
            aria-hidden="true"
            component="div"
            css={{ marginTop: '0.5rem' }}
          />
          <div style={{ padding: '1rem' }}>
            <ButtonGroup
              alignment="end"
              orientation="horizontal"
            >
              <Button
                variant="secondary"
                onPress={() => {
                  if (closeBtn?.handleClick) {
                    closeBtn.handleClick();
                  } else {
                    handleClose();
                  }
                }}
              >
                {closeBtn?.btnText || 'Cancel'}
              </Button>
              {extraBtn && (
                <Button
                  variant={extraBtn.variant}
                  onPress={() => extraBtn.handleClick()}
                >
                  {extraBtn.btnText}
                </Button>
              )}
              {continueBtn && (
                <Button
                  variant={continueBtn?.variant ?? 'primary'}
                  onPress={() => continueBtn.handleClick()}
                >
                  {continueBtn.btnText || 'Continue'}
                </Button>
              )}
            </ButtonGroup>
          </div>
        </div>
      </Dialog>
    </BcGovModal>
  );
}

export default AlertDialog;
