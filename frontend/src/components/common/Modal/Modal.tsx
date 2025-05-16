import React from 'react';
import { Dialog, Modal as BcGovModal } from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children: React.ReactNode;
  modalStyle?: React.CSSProperties;
}

function Modal({ isOpen, onOpenChange, title, children, modalStyle }: ModalProps) {
  return (
    <BcGovModal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      style={modalStyle}
    >
      <Dialog
        isCloseable
        role="dialog"
      >
        <div style={{ padding: '1rem' }}>
          <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{title}</span>
          <Divider
            aria-hidden="true"
            component="div"
            css={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
          />
          {children}
        </div>
      </Dialog>
    </BcGovModal>
  );
}

export default Modal;
