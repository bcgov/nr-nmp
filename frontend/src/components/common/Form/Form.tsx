import React from 'react';
import { FormProps as BaseFormProps, PressEvent } from 'react-aria-components';
import { Button, ButtonGroup, Form as BcGovForm } from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import { formCss } from '@/common.styles';

export interface FormProps extends BaseFormProps {
  children: React.ReactNode;
  // TODO: If these buttons aren't featured in every modal, make these optional and
  // only display buttons when they are defined
  onCancel: ((e: PressEvent) => void) | undefined;
  // Should be defined if onSubmit is undefined
  onConfirm?: ((e: PressEvent) => void) | undefined;
  isConfirmDisabled?: boolean;
  submitButtonText?: string;
}

export default function Form({
  children,
  onCancel,
  onConfirm,
  isConfirmDisabled,
  submitButtonText,
  ...props
}: FormProps) {
  return (
    <BcGovForm
      css={formCss}
      {...props}
    >
      {children}
      <Divider
        aria-hidden="true"
        component="div"
        css={{ marginTop: '1rem', marginBottom: '1rem' }}
      />
      <ButtonGroup
        alignment="end"
        orientation="horizontal"
      >
        <Button
          variant="secondary"
          onPress={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={onConfirm}
          isDisabled={isConfirmDisabled}
          type="submit"
        >
          {submitButtonText || 'Confirm'}
        </Button>
      </ButtonGroup>
    </BcGovForm>
  );
}
