import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css'
import '../../src/styles/vars.css'

createApp(App)
  .use(router)
  .mount('#app')
