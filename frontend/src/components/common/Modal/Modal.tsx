import React from 'react';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CloseButton,
} from './modal.styles';

interface ModalProps {
  isVisible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}

function Modal({ isVisible, title, children, onClose, footer }: ModalProps) {
  if (!isVisible) return null;

  return (
    <ModalWrapper>
      <ModalContent>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter id="footer">{footer}</ModalFooter>}
      </ModalContent>
    </ModalWrapper>
  );
}

export default Modal;
