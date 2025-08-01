import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/index.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
// export const createApp = ViteSSG(
//   App,
//   {
//     routes: setupLayouts(routes),
//     base: import.meta.env.BASE_URL,
//     scrollBehavior(to, from, savedPosition) {
//       if (savedPosition) {
//         return savedPosition
//       }

//       if (to.hash) {
//         return {
//           el: to.hash,
//           behavior: 'smooth',
//         }
//       }

//       return {
//         top: 0,
//         left: 0,
//       }
//     },
//   },
// )
