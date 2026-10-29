/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Unit tests sit next to the code. The browser accessibility checks in a11y/ run with Playwright instead.
  test: { include: ['src/**/*.test.{ts,tsx}'] },
})
