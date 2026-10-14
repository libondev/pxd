import type { BreadcrumbProps } from '../components/breadcrumb/types'
import { createContext } from '../utils/_internal/context.js'

export const [provideBreadcrumbContext, useBreadcrumbContext] =
  createContext<BreadcrumbProps>('Breadcrumb')
