# pxd

A stylish modern component library for Vue3.

## Installation

```bash
npm install pxd
# or
yarn add pxd
# or
pnpm add pxd
```

## Usage

### Global

```js
import { createApp } from 'vue'
import App from './App.vue'
import Pxd from 'pxd'
import 'pxd/dist/_styles/index.css'

const app = createApp(App)
app.use(Pxd)
app.mount('#app')
```
