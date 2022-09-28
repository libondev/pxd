import jsx from '@vitejs/plugin-vue-jsx'
import glob from 'fast-glob'
import { resolve } from 'path'
import { rollup } from 'rollup'
import esbuild, { minify } from 'rollup-plugin-esbuild'

async function runBuild () {
  const input = await glob('components/**/index.tsx')
  const outDir = resolve(process.cwd(), 'dist/')

  const bundle = await rollup({
    input,
    treeshake: true,
    external: ['vue'],
    plugins: [
      jsx(),
      esbuild({
        target: 'es2018',
        treeShaking: true,
        // jsx: 'transform',
        // jsxFactory: 'h',
        // jsxFragment: 'Fragment',
        loaders: { '.vue': 'ts' },
        tsconfig: '../tsconfig.json'
      }),
      minify({ target: 'es2018' })
    ]
  })

  await bundle.write({
    module: 'ESNext',
    format: 'esm',
    output: {
      name: 'es',
      dir: outDir,
      preserveModules: true,
      preserveModulesRoot: outDir
    }
  })
}

runBuild().catch(console.error)
