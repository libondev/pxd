function camelize(name: string): string {
  const camelCase = name.replace(/-(\w)/g, (_, c) => c.toUpperCase())
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

const componentsMap = import.meta.glob([
  '../pages/components/**/*.md',
], { eager: true })

export const components = Object.keys(componentsMap).map((path) => {
  const name = path.split('/').pop()!.replace('.md', '')

  return {
    name,
    camelized: camelize(name),
  }
})
