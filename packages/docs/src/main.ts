// import ui from 'pxd'

import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

import './styles/index.css'
import 'markdown-it-plugins/container.css'
import 'markdown-it-plugins/noticeboard.css'
import 'markdown-it-plugins/code-line-numbers.css'
import 'markdown-it-plugins/collect-block-code.css'

const app = createApp(App)

app.use(router)
// app.use(ui)

app.mount('#app')
