import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.window.config = {};

// From https://stackoverflow.com/questions/69906136/console-error-error-could-not-parse-css-stylesheet
const originalConsoleError = console.error;
console.error = function (...data) {
  if (typeof data[0]?.toString === 'function' && data[0].toString().includes('Error: Could not parse CSS stylesheet')) return;
  originalConsoleError(...data);
};

jest.mock('@/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5174',
  },
}));

jest.spyOn(React, 'useId').mockImplementation(() => 'mocked-id');
