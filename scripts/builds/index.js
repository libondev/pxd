import modules from './modules.js'
import overall from './overall.js'

Promise.all([
  overall(),
  modules()
])
  .catch(console.error)
