import type { App } from 'vue'

declare module '*.vue' {
  export default App
}

declare module '*.module.css' {
  const classes: CSSModuleClasses
  export default classes
}

declare module '*.module.scss' {
  const classes: CSSModuleClasses
  export default classes
}
