let _id = 0

export function getUniqueId() {
  return `_pid_${_id++}`
}
