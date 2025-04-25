// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    watchForFileChanges: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
