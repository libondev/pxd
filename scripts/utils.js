import { camelize } from '@vue/shared'

/**
 * @param {string} name
 * @returns {string} 转换后的字符串
 */
export function pascalize(name) {
  const camelized = camelize(name)
  return camelized.charAt(0).toUpperCase() + camelized.slice(1)
}
