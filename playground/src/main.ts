import { createApp } from 'vue'
import App from './App.vue'

import Carbons from '../../components'

createApp(App).use(Carbons({ size: 'medium' })).mount('#app')
