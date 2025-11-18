import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CocoonChat',
      fileName: 'cocoon-chat',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
