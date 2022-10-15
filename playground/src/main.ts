import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

import CarbonsInstall from '../../src'
import '../../src/_styles/index.scss'

const app = createApp(App)

// @ts-ignore
app.use(CarbonsInstall)

app.use(router)

app.mount('#app')
