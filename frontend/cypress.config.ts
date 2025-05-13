// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';
// @ts-ignore
import * as LogToOutput from 'cypress-log-to-output/src/log-to-output';
import defineViteConfig from './vite.config';

export default defineConfig({
  component: {
    watchForFileChanges: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: defineViteConfig({ command: 'serve', mode: '' }), // Should do the same thing as running 'npx vite serve' locally
    },
    setupNodeEvents(on) {
      LogToOutput.install(on);
    }
  },
});
