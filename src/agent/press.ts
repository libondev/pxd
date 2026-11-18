import type { RefuseUnlessAllowed } from './allow.js'
import type { AgentEntry } from './registry.js'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { agentDisabled, buttonsOf, fold, nameOf } from './describe.js'
import { agentElement, agentPressable } from './registry.js'

export type PressOutcome = { pressed: string } | { error: string }

// How many renders press waits through for a part whose content arrives late.
const PRESS_ATTEMPTS = 3

// Clicks the button a step names, and nothing else. A closed popup is opened by its own
// step, so a press never renders one to find out what it would click: the page stays as the
// person left it, and the step that opens something is one `allow` sees.
export function createPress(refuseUnlessAllowed: RefuseUnlessAllowed) {
  return async (entry: AgentEntry, text?: unknown, signal?: AbortSignal): Promise<PressOutcome> => {
    const asked = typeof text === 'string' && text ? text : undefined
    const wanted = asked ? fold(asked) : undefined
    const names = (buttons: { name: string }[]) => buttons.map((button) => button.name).join(', ')
    // How a step of its own would open this component, when it has a way.
    const opens = ['setOpen', 'toggle'].find(
      (action) => typeof entry.node.actions[action] === 'function',
    )

    const read = () =>
      buttonsOf(agentElement(entry), agentPressable(entry))
        .map((el) => ({ el, name: nameOf(el) }))
        .filter((button) => button.name)

    // What this attempt found: a button to press, a message to fail with, and whether
    // waiting for another render could change the answer.
    const pick = () => {
      const buttons = read()

      if (!buttons.length) {
        if (!agentPressable(entry)) {
          const actions = Object.keys(entry.node.actions)

          return {
            message: `"${entry.node.name}" is not pressed by a click. It takes: ${actions.join(', ') || 'nothing'}.`,
            retry: false,
          }
        }

        return {
          message: `"${entry.node.name}" has no buttons to press.${
            opens ? ` Open it first with ${opens}, then press.` : ''
          }`,
          retry: true,
        }
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
        message: `"${entry.node.name}" has no button matching "${asked}"; it has: ${names(buttons)}.${
          opens ? ` Open it first with ${opens}, then press.` : ''
        }`,
        retry: true,
      }
    }

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
          return { error: `${entry.node.name} ${entry.ref} is disabled now.` }
        }

        const refused = await refuseUnlessAllowed(entry, {
          action: 'press',
          args: [found.target.name],
          els: [found.target.el],
          signal,
        })

        if (refused) {
          return { error: refused }
        }

        withChangeDetails({ source: 'agent' }, () => found.target.el.click())
        await nextTick()

        return { pressed: found.target.name }
      }

      message = found.message ?? message

      if (!found.retry) {
        break
      }
    }

    return { error: message }
  }
}
