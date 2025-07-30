import React from 'react';
import {
  NumberField as ReactAriaNumberField,
  NumberFieldProps as ReactAriaNumberFieldProps,
  Input,
  Label,
  FieldError,
  Text,
  ValidationResult,
} from 'react-aria-components';
import '@bcgov/design-tokens/css/variables.css';
import { SvgExclamationIcon } from '@bcgov/design-system-react-components';

import './NumberField.css';

export interface NumberFieldProps extends ReactAriaNumberFieldProps {
  /* Sets size of text input field */
  size?: 'medium' | 'small';
  /* Sets text label above text input field */
  label?: string;
  /* Sets optional description text below text input field */
  description?: string;
  /* Used for data validation and error handling */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /* Icon slot to left of text input field */
  iconLeft?: React.ReactElement;
  /* Icon slot to right of text input field */
  iconRight?: React.ReactElement;
}

export default function NumberField({
  size,
  label,
  description,
  errorMessage,
  iconLeft,
  iconRight,
  ...props
}: NumberFieldProps) {
  return (
    <ReactAriaNumberField
      className="bcds-react-aria-NumberField"
      {...props}
    >
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label className="bcds-react-aria-NumberField--Label">
              {label}
              {isRequired && (
                <span className="bcds-react-aria-NumberField--Label required">(required)</span>
              )}
            </Label>
          )}
          <div
            className={`bcds-react-aria-NumberField--container ${size === 'small' ? 'small' : 'medium'}`}
          >
            {iconLeft}
            <Input className="bcds-react-aria-NumberField--Input" />
            {isInvalid && <SvgExclamationIcon />}
            {iconRight}
          </div>
          {description && (
            <Text
              slot="description"
              className="bcds-react-aria-NumberField--Description"
            >
              {description}
            </Text>
          )}
          <FieldError className="bcds-react-aria-NumberField--Error">{errorMessage}</FieldError>
        </>
      )}
    </ReactAriaNumberField>
  );
}
