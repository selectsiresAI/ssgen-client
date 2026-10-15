import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Testes de contrato (sem rede): o cliente Supabase só precisa de valores de mentira para carregar.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts'],
      env: { VITE_SUPABASE_URL: 'http://localhost:54321', VITE_SUPABASE_ANON_KEY: 'test-key' },
    },
  }),
)
