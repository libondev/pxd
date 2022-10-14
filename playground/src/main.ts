import { createApp } from 'vue'
import App from './App.vue'

import CarbonsUI from '../../src'
// import { CButton, CSwitch, CProvider, CIcon } from '../../src'

import '../../src/index.scss'

const app = createApp(App)

app.use(CarbonsUI())

// app.use(CProvider.install)
// app.use(CButton.install)
// app.use(CSwitch.install)
// app.use(CIcon.install)

app.mount('#app')
