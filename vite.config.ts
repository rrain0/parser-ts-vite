import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'



export default defineConfig(({ command, mode }) => {
  
  return {
    // Make url paths absolute (relative to root)
    base: '/',
    
    resolve: {
      //tsconfigPaths: true, // works only for TS (excluding Workers)
      
      // Works for TS (+ Workers), CSS
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
        '@@': fileURLToPath(new URL('src/shared', import.meta.url)),
      },
    },
    
    build: {
      lib: {
        // Defines the entry point of your module
        entry: fileURLToPath(new URL('src/main.ts', import.meta.url)),
        // The global variable name used when your module is loaded via a script tag
        name: 'parser',
        // Output formats: ES modules (modern) and UMD (classic script tag support)
        formats: ['es', 'umd'],
        // The naming convention for output files
        fileName: (format) => `parser.${format}.js`,
      },
      sourcemap: true, // Optional: useful for debugging in the browser
      target: 'esnext', // Ensures it compiles down to modern browser-compatible JS
    },
  }
})
