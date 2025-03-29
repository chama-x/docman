import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import * as svgr from '@svgr/core'
import * as fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  
  return {
    plugins: [
      react(),
      // Custom SVG loader
      {
        name: 'vite-svg-loader',
        enforce: 'pre',
        async transform(code, id) {
          if (!id.endsWith('.svg')) return null
          
          // Extract the file name and directory
          const fileName = path.basename(id)
          
          try {
            // Read the SVG file
            const svg = await fs.promises.readFile(id, 'utf8')
            
            // Transform SVG to React component
            const svgComponent = await svgr.transform(
              svg,
              {
                plugins: ['@svgr/plugin-jsx'],
                jsx: {
                  babelConfig: {
                    plugins: [
                      ['@babel/plugin-transform-react-jsx', { useBuiltIns: true }]
                    ]
                  }
                },
                icon: true,
                typescript: true,
                ref: true,
                memo: true,
                titleProp: true,
                descriptionProp: true,
              },
              { componentName: fileName.replace(/\.svg$/, '').replace(/[^a-zA-Z0-9]/g, '') + 'Icon' }
            )
            
            return {
              code: `${svgComponent}`,
              map: null
            }
          } catch (error) {
            console.error('Error transforming SVG:', error)
            return null
          }
        }
      },
      // Add bundle analyzer in analyze mode
      mode === 'analyze' && {
        name: 'analyze',
        generateBundle() {
          console.log('Bundle analysis is disabled. Install rollup-plugin-visualizer manually if needed.');
        }
      }
    ].filter(Boolean), // Filter out false values for conditional plugins
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
        '@services': path.resolve(__dirname, './src/services'),
        '@stores': path.resolve(__dirname, './src/stores'),
      },
    },
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    build: {
      outDir: 'dist',
      minify: 'esbuild', // Use esbuild instead of terser for faster builds
      sourcemap: isProd ? false : true,
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            vendor: [
              '@tanstack/react-query',
              'axios',
              'react-hook-form',
              'zustand',
            ],
          },
        },
      },
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Set chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // Configure coverage
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    // Configure CSS modules
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  }
})
