import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Wiki Walk',
    description:
      'Turns your Wikipedia browsing sessions into a navigable, retraceable trail.',
    permissions: ['storage', 'sidePanel'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
