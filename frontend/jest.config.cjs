module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: 'tsconfig.app.json' }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  transformIgnorePatterns: ['/node_modules/(?!@bcgov|jspdf)'],

  modulePaths: ['<rootDir>'],

  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'babel-jest',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/setupFiles.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
