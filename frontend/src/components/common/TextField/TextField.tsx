/**
 * This file is an EXACT copy of
 * https://github.com/bcgov/design-system/blob/main/packages/react-components/src/components/TextField/TextField.tsx
 * with the errorMessage prop removed. (plus some styling fixes)
 * This errorMessage prop breaks the built-in validate function from React Aria.
 *
 * This file should be updated if the source component is updated, but the BCGov
 * Design System is paused on development.
 */

import React from 'react';
import {
  TextField as ReactAriaTextField,
  TextFieldProps as ReactAriaTextFieldProps,
  Input,
  Label,
  FieldError,
  Text,
} from 'react-aria-components';
import { SvgExclamationIcon } from '@bcgov/design-system-react-components';

import '@bcgov/design-tokens/css/variables.css';
import './TextField.css';

export interface TextFieldProps extends ReactAriaTextFieldProps {
  /* Sets size of text input field */
  size?: 'medium' | 'small';
  /* Sets text label above text input field */
  label?: string;
  /* Sets optional description text below text input field */
  description?: string;
  /* Icon slot to left of text input field */
  iconLeft?: React.ReactElement;
  /* Icon slot to right of text input field */
  iconRight?: React.ReactElement;
}

export default function TextField({
  size,
  label,
  description,
  iconLeft,
  iconRight,
  ...props
}: TextFieldProps) {
  return (
    <ReactAriaTextField
      className="bcds-react-aria-TextField"
      {...props}
    >
      {({ isRequired, isInvalid }) => (
        <>
          {label && (
            <Label className="bcds-react-aria-TextField--Label">
              {label}
              {isRequired && <span className="bcds-react-aria-TextField--Label"> (required)</span>}
            </Label>
          )}
          <div
            className={`bcds-react-aria-TextField--container ${size === 'small' ? 'small' : 'medium'}`}
          >
            {iconLeft}
            <Input className="bcds-react-aria-TextField--Input" />
            {isInvalid && <SvgExclamationIcon />}
            {iconRight}
          </div>
          {description && (
            <Text
              slot="description"
              className="bcds-react-aria-TextField--Description"
            >
              {description}
            </Text>
          )}
          <FieldError className="bcds-react-aria-TextField--Error" />
        </>
      )}
    </ReactAriaTextField>
  );
}
