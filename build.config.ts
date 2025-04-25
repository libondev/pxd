import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  externals: ['vue'],
  entries: [
    {
      builder: 'mkdist',
      input: './src',
      pattern: ['**/*.vue'],
      loaders: ['vue'],
    },
    {
      builder: 'mkdist',
      input: './src',
      pattern: ['**/*.ts'],
      format: 'esm',
      loaders: ['js'],
      ext: 'js',
    },
    {
      builder: 'mkdist',
      input: './src',
      pattern: ['**/*.css'],
      format: 'esm',
      loaders: ['sass'],
      ext: 'js',
    },
  ],
})
