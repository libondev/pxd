// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import UI from 'pxd'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.css'

const app = createApp(App)

app.use(router)
app.use(UI)

app.mount('#app')
