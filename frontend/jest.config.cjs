module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: "tsconfig.app.json" }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  transformIgnorePatterns: ['/node_modules/'],

  modulePaths: ['<rootDir>'],

  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'babel-jest',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
