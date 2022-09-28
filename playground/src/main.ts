import { createApp } from 'vue'
import App from './App.vue'

// @ts-ignore
import CarbonsUI from '../../dist/index.js'

import '../../dist/index.css'

createApp(App).use(CarbonsUI()).mount('#app')
