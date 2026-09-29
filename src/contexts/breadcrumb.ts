import type { BreadcrumbProps } from '../components/breadcrumb/types'
import { createContext } from '../utils/context.js'

export const [provideBreadcrumbContext, useBreadcrumbContext] =
  createContext<BreadcrumbProps>('Breadcrumb')
