export function noop (): void { }

export function stopPropagation (evt: Event): void {
  evt.stopPropagation()
}

export function preventDefault (evt: Event): void {
  evt.preventDefault()
}

export const INTERACTIVE_ELEMENTS = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
