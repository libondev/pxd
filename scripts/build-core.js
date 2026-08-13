import { mkdist } from 'mkdist'

await mkdist({
  declaration: true,
  srcDir: 'src',
  distDir: 'dist',
  ext: 'js',
  format: 'esm',
  loaders: ['js', 'vue', 'sass', 'postcss'],
})
