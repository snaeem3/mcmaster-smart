import { defineConfig } from 'vite'
import { sharedConfig } from './vite.config.mjs'
import { isDev, r } from './scripts/utils'
import packageJson from './package.json'

// bundling the content script using Vite
export default defineConfig({
  ...sharedConfig,
  define: {
    '__DEV__': isDev,
    '__NAME__': JSON.stringify(packageJson.name),
    // https://github.com/vitejs/vite/issues/9320
    // https://github.com/vitejs/vite/issues/9186
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
  build: {
    watch: isDev
      ? {}
      : undefined,
    outDir: r('extension/dist/contentScripts'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src/contentScripts/index.ts'),
      name: packageJson.name,
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
})

/// /// CONFIGS BELOW DID NOT WORK
// No-lib - "Cannot use import statement outside of a module error"
// export default defineConfig({
//   ...sharedConfig,
//   define: {
//     '__DEV__': isDev,
//     '__NAME__': JSON.stringify(packageJson.name),
//     'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
//   },
//   build: {
//     watch: isDev ? {} : undefined,
//     outDir: r('extension/dist/contentScripts'),
//     cssCodeSplit: false,
//     emptyOutDir: false,
//     sourcemap: isDev ? 'inline' : false,
//     rollupOptions: {
//       // Tell Rollup/Vite about multiple inputs:
//       input: {
//         index: r('src/contentScripts/index.ts'),
//         mscScript: r('src/contentScripts/mscScript.ts'),
//         // 'background': r('src/background/index.ts'),
//       },
//       output: {
//         // Use [name] to match the keys above
//         entryFileNames: '[name].global.js',
//         extend: true,
//         // If you wanted subfolders:
//         // entryFileNames: '[name]/index.js',
//       },
//     },
//   },
// })

// No lib inline dynamic imports:true
// ERROR: Invalid value for option "output.inlineDynamicImports" - multiple inputs are not supported when "output.inlineDynamicImports" is true.
// export default defineConfig({
//   ...sharedConfig,
//   define: {
//     '__DEV__': isDev,
//     '__NAME__': JSON.stringify(packageJson.name),
//     // https://github.com/vitejs/vite/issues/9320
//     // https://github.com/vitejs/vite/issues/9186
//     'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
//   },
//   build: {
//     watch: isDev
//       ? {}
//       : undefined,
//     outDir: r('extension/dist/contentScripts'),
//     cssCodeSplit: false,
//     emptyOutDir: false,
//     sourcemap: isDev ? 'inline' : false,
//     rollupOptions: {
//       input: {
//         index: r('src/contentScripts/index.ts'),
//         mscScript: r('src/contentScripts/mscScript.ts'),
//       },
//       output: {
//         entryFileNames: '[name].global.js',
//         extend: true,
//         format: "esm",
//         inlineDynamicImports: true,
//       },
//     },
//   },
// })
