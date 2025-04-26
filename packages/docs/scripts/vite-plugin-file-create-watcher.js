import { exec } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

export function fileCreateWatcher() {
  return {
    name: 'file-create-watcher',
    configureServer(server) {
      const watcher = server.watcher

      watcher.add([
        path.resolve(process.cwd(), 'src/pages/components'),
      ])

      watcher.on('add', (filePath) => {
        // 如果创建的不是 .md 文件, 则不处理
        // 在创建 .md 文件的时候更新组件的导出结果
        if (!filePath.endsWith('.md')) {
          return
        }

        exec('cd ../.. && pnpm update-exports', (error) => {
          if (error) {
            console.error(`执行错误: ${error}`)
          }
        })
      })
    },
  }
}
