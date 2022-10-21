import '../../src/_styles/index.scss'

import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { createApp } from 'vue'
import { installer } from '../../src'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const app = createApp(App)

app.use(installer)

app.use(router)

app.mount('#app')
