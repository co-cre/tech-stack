import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts'],
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/test/**'],
		},
	},
	resolve: {
		alias: {
			db: path.resolve(__dirname, '../../packages/db/src'),
			'db/schema': path.resolve(__dirname, '../../packages/db/src/schema'),
		},
	},
})
