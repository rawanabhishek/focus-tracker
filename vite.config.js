import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/focus-tracker/', // ← change this to your GitHub repo name
})
