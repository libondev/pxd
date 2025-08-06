import path from 'node:path'
import fs from 'fs-extra'

export function getRelativePathByFile(from: string, target: string) {
  let relativePath = path.relative(path.dirname(from), target).replace(/\\/g, '/')

  if (!relativePath.startsWith('../') && !relativePath.startsWith('./')) {
    relativePath = `./${relativePath}`
  }

  return relativePath
}

export function getRelativePathFromRoot(target: string) {
  const paths = target.split('/')
  paths.pop()

  return paths.map(() => '..').join('/')
}

// 如果文件存在则直接读取并返回内容，如果不存在则创建这个文件并返回空字符串
export async function readOrCreate(filePath: string) {
  if (await fs.pathExists(filePath)) {
    const content = await fs.readFile(filePath, 'utf-8')
    return content as string
  }

  await fs.createFile(filePath)

  return ''
}

export async function upsertFile(
  filePath: string,
  content: string,
  insertContent: string,
  position: 'start' | 'end' = 'end',
) {
  if (content.includes(insertContent)) {
    return
  }

  if (position === 'start') {
    content = `${insertContent}\n${content}`
  } else {
    content = `${content}\n${insertContent}`
  }

  await fs.outputFile(filePath, content)
}
