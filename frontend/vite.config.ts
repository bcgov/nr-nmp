/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const define: Record<string, any> = {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  };

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.VITE_PORT),
    },
    plugins: [
      {
        name: 'build-html',
        apply: 'build',
        transformIndexHtml: (html) => ({
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                src: '/env.js',
              },
              injectTo: 'head',
            },
          ],
        }),
      },
      react({ jsxImportSource: '@emotion/react' }),
    ],
    define,
  };
});
