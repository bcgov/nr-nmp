// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';
// @ts-ignore
import * as LogToOutput from 'cypress-log-to-output/src/log-to-output';
import { setupWorker } from 'msw/browser';

export default defineConfig({
  component: {
    watchForFileChanges: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on, _config) {
      LogToOutput.install(on);
    }
  },
});
