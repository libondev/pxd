let _id = 0

export function getUniqueId(prefix: string = '') {
  return `${prefix}_pid_${_id++}`
}
