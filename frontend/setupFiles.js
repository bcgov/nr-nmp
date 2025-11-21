import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

jest.mock('@/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:5174',
  },
}));

global.window.config = {};
