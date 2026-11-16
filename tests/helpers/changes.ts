export function changePayloads(component: { emitted: (event: string) => unknown[][] | undefined }) {
  return component.emitted('change')?.map((args) => args[0])
}

export function lastChangePayload(component: {
  emitted: (event: string) => unknown[][] | undefined
}) {
  return component.emitted('change')?.at(-1)?.[0]
}
