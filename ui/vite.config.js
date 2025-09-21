import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Update the `base` if the site is hosted somewhere else.
export default defineConfig({
  base: '/writeups/',
  plugins: [react()],
});
