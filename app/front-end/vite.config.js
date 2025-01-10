import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure the base URL is correct
  build: {
    outDir: 'dist', // Matches your Amplify configuration
  },
})
