import type { BreadcrumbProps } from '../components/breadcrumb/types'
import { createContext } from '../utils/context'

export const [provideBreadcrumbContext, useBreadcrumbContext] =
  createContext<BreadcrumbProps>('Breadcrumb')
