import { createApp } from 'vue'
import App from './App.vue'

import CarbonsUI from '../../dist'

import '../../components/index.scss'

createApp(App).use(CarbonsUI()).mount('#app')
