export interface TeleportProps {
  to?: string | HTMLElement
  disabled?: boolean
}

export interface TeleportLocation {
  parent: Node
  nextSibling: Node | null
}
