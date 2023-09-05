import glob from 'fast-glob'
import fs from 'fs'

const emptyFiles = [
  'dist/styles.js',
  'dist/styles.d.ts'
]

glob.sync('dist/**/*.js').forEach(file => {
  if (emptyFiles.includes(file)) {
    // 删除空文件
    fs.unlinkSync(file)
  }
})
