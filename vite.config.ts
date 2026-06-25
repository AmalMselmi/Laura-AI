import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/** Override when port 8000 is taken, e.g. `LAURA_API_PROXY_TARGET=http://127.0.0.1:8010 npm run dev` */
const apiTarget =
  process.env.LAURA_API_PROXY_TARGET?.trim() || 'http://127.0.0.1:8000';

const apiProxy = {
  '/api': {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  },
  // Same-origin health checks from the login page (mirrors Docker nginx `/health` → API).
  '/health': {
    target: apiTarget,
    changeOrigin: true,
    secure: false,
  },
} as const;

export default defineConfig({
  server: {
    // Dev: call `/api/...` on the same origin as Vite; avoids localhost vs 127.0.0.1 cookie issues.
    proxy: { ...apiProxy },
  },
  preview: {
    // `vite preview` does not inherit `server.proxy` — mirror it so `/api/*` works locally.
    proxy: { ...apiProxy },
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
