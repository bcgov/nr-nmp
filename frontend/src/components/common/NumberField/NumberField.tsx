import React, { useMemo } from 'react';
import {
  NumberField as ReactAriaNumberField,
  NumberFieldProps as ReactAriaNumberFieldProps,
  Input,
  Label,
  FieldError,
  Text,
} from 'react-aria-components';
import { SvgExclamationIcon } from '@bcgov/design-system-react-components';

import '@bcgov/design-tokens/css/variables.css';
import './NumberField.css';

export interface NumberFieldProps
  extends Omit<ReactAriaNumberFieldProps, 'validate, minValue, maxValue'> {
  /* Sets size of text input field */
  size?: 'medium' | 'small';
  /* Sets text label above text input field */
  label?: string | React.ReactNode;
  /* Sets optional description text below text input field */
  description?: string;
  /* Icon slot to left of text input field */
  iconLeft?: React.ReactElement;
  /* Icon slot to right of text input field */
  iconRight?: React.ReactElement;
  /* Minimum valid value */
  minValue?: number;
  /* Maximum valid value */
  maxValue?: number;
  /* For small fields, display (req) instead of (required) */
  shortenRequired?: boolean;
}

export default function NumberField({
  size,
  label,
  description,
  iconLeft,
  iconRight,
  minValue = 0,
  maxValue,
  shortenRequired,
  step = 0.01,
  ...props
}: NumberFieldProps) {
  const validate = useMemo(() => {
    if (minValue !== undefined && maxValue !== undefined) {
      return (value: number) =>
        value < minValue! || value > maxValue!
          ? [`Must be between ${minValue} and ${maxValue}.`]
          : undefined;
    }
    if (minValue !== undefined) {
      return (value: number) => (value < minValue! ? [`Minimum is ${minValue}.`] : undefined);
    }
    if (maxValue !== undefined) {
      return (value: number) => (value < maxValue! ? [`Maximum is ${maxValue}.`] : undefined);
    }
    return undefined;
  }, [minValue, maxValue]);

  return (
    <ReactAriaNumberField
      className="bcds-react-aria-NumberField"
      validate={validate}
      step={step}
      {...props}
    >
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label className="bcds-react-aria-NumberField--Label">
              {label}
              {isRequired && (
                <span className="bcds-react-aria-NumberField--Label">
                  {shortenRequired ? ' (req)' : ' (required)'}
                </span>
              )}
            </Label>
          )}
          <div
            className={`bcds-react-aria-NumberField--container ${size === 'small' ? 'small' : 'medium'}`}
          >
            {iconLeft}
            <Input
              className="bcds-react-aria-NumberField--Input"
              // Force input to inherit width from parent div
              css={{ width: '100%' }}
            />
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
          <FieldError className="bcds-react-aria-NumberField--Error" />
        </>
      )}
    </ReactAriaNumberField>
  );
}
