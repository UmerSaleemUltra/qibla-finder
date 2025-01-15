import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from network devices or a specific host
    port: 3000, // Optional: Specify a custom port (default is 5173)
  },
});
