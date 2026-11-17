import type { RefuseUnlessAllowed } from './allow.js'
import type { AgentEntry } from './registry.js'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { agentDisabled, buttonsOf, fold, nameOf } from './describe.js'
import { agentElement } from './registry.js'

export type PressOutcome = { pressed: string } | { error: string }

// How many renders press waits through for a popup whose content arrives late.
const PRESS_ATTEMPTS = 3

// Clicks the button a step names. A popup that has not rendered yet, or whose content is
// still arriving, is read again a few times inside the run's budget rather than once.
export function createPress(refuseUnlessAllowed: RefuseUnlessAllowed) {
  return async (entry: AgentEntry, text?: unknown, signal?: AbortSignal): Promise<PressOutcome> => {
    const asked = typeof text === 'string' && text ? text : undefined
    const wanted = asked ? fold(asked) : undefined
    const names = (buttons: { name: string }[]) => buttons.map((button) => button.name).join(', ')

    const read = () =>
      buttonsOf(agentElement(entry))
        .map((el) => ({ el, name: nameOf(el) }))
        .filter((button) => button.name)

    // What this attempt found: a button to press, a message to fail with, and whether
    // waiting for another render could change the answer.
    const pick = () => {
      const buttons = read()

      if (!buttons.length) {
        return { message: `"${entry.node.name}" has no buttons to press.`, retry: true }
      }

      if (wanted === undefined) {
        return buttons.length === 1
          ? { target: buttons[0] }
          : {
              message: `"${entry.node.name}" has ${buttons.length} buttons; name one of: ${names(buttons)}.`,
              retry: false,
            }
      }

      const exact = buttons.filter((button) => fold(button.name) === wanted)
      const near = exact.length
        ? exact
        : buttons.filter((button) => fold(button.name).includes(wanted))

      if (near.length === 1) {
        return { target: near[0] }
      }

      if (near.length > 1) {
        return {
          message: `"${entry.node.name}" has ${near.length} buttons matching "${asked}"; name one of: ${names(near)}.`,
          retry: false,
        }
      }

      return {
        message: `"${entry.node.name}" has no button matching "${asked}"; it has: ${names(buttons)}.`,
        retry: true,
      }
    }

    // A popup opened only to find a button closes again when the search fails, so the next
    // step and the person see the page as it was.
    const close = async () => {
      if (!opened) {
        return
      }

      opened = false

      withChangeDetails({ source: 'agent' }, () => entry.node.actions.setOpen?.(false))
      await nextTick()
    }

    let opened = false
    let message = ''

    for (let attempt = 0; attempt < PRESS_ATTEMPTS; attempt++) {
      if (attempt) {
        // A macrotask, not just a tick: content that arrives in a timer or a transition
        // lands here, while a fetch still needs the app to have the data ready.
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      const found = pick()

      if ('target' in found && found.target) {
        if (agentDisabled(entry)) {
          await close()

          return { error: `${entry.node.name} ${entry.ref} is disabled now.` }
        }

        const refused = await refuseUnlessAllowed(entry, {
          action: 'press',
          args: [found.target.name],
          el: found.target.el,
          signal,
        })

        if (refused) {
          await close()

          return { error: refused }
        }

        withChangeDetails({ source: 'agent' }, () => found.target.el.click())
        await nextTick()

        return { pressed: found.target.name }
      }

      message = found.message ?? message

      // A closed popup renders nothing: open it once, then give the content a render or two.
      if (!opened && entry.node.actions.setOpen) {
        opened = true

        withChangeDetails({ source: 'agent' }, () => entry.node.actions.setOpen?.(true))

        continue
      }

      if (!found.retry) {
        break
      }
    }

    await close()

    return { error: message }
  }
}
