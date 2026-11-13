import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        services: 'services.html',
        gallery: 'gallery.html',
        quote: 'quote.html',
        contact: 'contact.html',
      },
    },
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
});
