# NMP Frontend

- [Expanding the ESLint configuration](#expanding-the-eslint-configuration)
- [Developing](#developing)
  - [Scripts to Run Before Check-In](#scripts-to-run-before-check-in)
- [Testing](#testing)
  - [Running Tests](#running-tests)
- [Project READme's](#project-readmes)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```

## Developing

### Scripts to Run Before Check-In

Before checking in code, within `/frontend` run `npm run format` and then immediately `npm run lint`.

## Testing

### Running Tests

Both Jest and Cypress tests are used to test the code.
For Jest both unit and snapshot tests are used.

To run all tests, run `npm run test`. You can run just the Jest or Cypress tests with `npm run test:jest` or `npm run test:cypress` respectively.

After creating a snapshot test run `npm run test:jest` to automatically create a snapshot (ex. Component.test.jsx.snap). To update snapshots run `npm run test:jest -- -u` which will run all tests and update snapshots.

## Project READme's

- [Main Readme](/README.md)
- [Backend Readme](/backend/README.md)
- [Database Readme](/database/README.md)
