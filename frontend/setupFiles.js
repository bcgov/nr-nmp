import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('@/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5174',
  },
}));

global.window.config = {};
