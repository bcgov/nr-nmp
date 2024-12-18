/* eslint-disable react/button-has-type */
// This is copy-pasted from RefreshExpiryDialog in citz-imb-sso-react

import { Dispatch, SetStateAction } from 'react';

type DialogModalProps = {
  text: string;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};

export default function DialogModal({ text, isVisible, setIsVisible }: DialogModalProps) {
  if (!isVisible) return null;

  return (
    <>
      <div className="ssor_dialog-overlay" />
      <dialog
        className="ssor_dialog"
        open={isVisible}
      >
        <div className="ssor_dialog-content">
          <p className="ssor_dialog-message">{text}</p>
          <button
            className="ssor_button"
            onClick={() => setIsVisible(false)}
          >
            Ok
          </button>
        </div>
      </dialog>
    </>
  );
}
