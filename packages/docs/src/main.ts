// import ui from 'pxd'

import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

import './styles/index.css'

const app = createApp(App)

app.use(router)
// app.use(ui)

app.mount('#app')
