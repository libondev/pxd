import { createHead } from '@unhead/vue/client'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/index.css'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(router)

app.mount('#app')
