import React from 'react';
import { FormProps as BaseFormProps, PressEvent } from 'react-aria-components';
import { Button, ButtonGroup, Form as BcGovForm } from '@bcgov/design-system-react-components';
import Divider from '@mui/material/Divider';
import { formCss } from '@/common.styles';

export interface FormProps extends BaseFormProps {
  children: React.ReactNode;
  onCancel: (e: PressEvent) => void;
  onCalculate?: () => void;
  isCalculateDisabled?: boolean;
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
  confirmButtonText?: string;
}

export default function Form({
  children,
  onCancel,
  onCalculate,
  isCalculateDisabled,
  onConfirm,
  isConfirmDisabled,
  confirmButtonText,
  ...props
}: FormProps) {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((e.nativeEvent as SubmitEvent).submitter!.innerHTML === 'Calculate') {
      if (!onCalculate) throw new Error('Calculate was pressed when undefined.');
      onCalculate();
    } else {
      onConfirm();
    }
  };

  return (
    <BcGovForm
      css={formCss}
      onSubmit={onSubmit}
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
        {onCalculate && (
          <Button
            variant="primary"
            isDisabled={isCalculateDisabled}
            type="submit"
          >
            Calculate
          </Button>
        )}
        <Button
          variant="primary"
          isDisabled={isConfirmDisabled}
          type="submit"
        >
          {confirmButtonText || 'Confirm'}
        </Button>
      </ButtonGroup>
    </BcGovForm>
  );
}
