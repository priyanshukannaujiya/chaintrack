import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose VITE_ prefixed env variables to the frontend bundle
  // Set VITE_API_BASE_URL in Vercel dashboard → Project Settings → Environment Variables
  // e.g. https://chaintrack-backend.onrender.com/api/v1
})
