import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    {
      builder: 'mkdist',
      input: './src',
      pattern: ['**/*.ts'],
      format: 'esm',
      loaders: ['js'],
      ext: 'js',
    },
  ],
})
