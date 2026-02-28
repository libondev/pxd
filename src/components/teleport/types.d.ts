export interface TeleportProps {
  to?: string | object
  disabled?: boolean
}

export interface TeleportLocation {
  parent: Node
  nextSibling: Node | null
}
