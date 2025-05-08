// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';
// @ts-ignore
import * as LogToOutput from 'cypress-log-to-output/src/log-to-output';
import { setupWorker } from 'msw/browser';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  component: {
    watchForFileChanges: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    setupNodeEvents(on) {
      LogToOutput.install(on);
      // on('file:preprocessor', vitePreprocessor({ configFile: './vite.config.ts' }));
    }
  },
});
