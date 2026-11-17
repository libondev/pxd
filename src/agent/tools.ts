import type { AgentTool } from './types'

// The three calls, written as JSON Schema so a model can be handed them as tool definitions.
// Each name is also the method that runs it: `agent[name](input)`.
export const agentTools: AgentTool[] = [
  {
    name: 'snapshot',
    description:
      'List every component on the page that an agent can drive, with its ref, name, label, state, choices and the actions it takes right now.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'act',
    description:
      'Run steps in order, each one an action a component listed in snapshot. Name the component by its ref or by its label; the run stops at the first failure and reports which step it was.',
    inputSchema: {
      type: 'object',
      properties: {
        steps: {
          type: 'array',
          description: 'The steps to run, in order.',
          items: {
            type: 'object',
            properties: {
              ref: {
                type: 'string',
                description: "A component's ref, or the label exactly one component answers to.",
              },
              action: {
                type: 'string',
                description:
                  "One of the component's actions, like setValue or setOpen; press clicks a button.",
              },
              args: {
                type: 'array',
                description: "The action's arguments, like the value for setValue.",
                items: {},
              },
            },
            required: ['ref', 'action'],
            additionalProperties: false,
          },
        },
        timeout: {
          type: 'number',
          description: 'How long the whole run may take, in milliseconds.',
        },
      },
      required: ['steps'],
      additionalProperties: false,
    },
  },
  {
    name: 'query',
    description:
      'Find components by a part of a label or by one of the choices inside them, optionally limited to those within another component or to one kind.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'A part of a label or of a choice, ignoring case and accents.',
        },
        within: {
          type: 'string',
          description: 'A ref or label; only components inside it are returned.',
        },
        kind: {
          type: 'string',
          description: 'A component name, like checkbox.',
        },
      },
      additionalProperties: false,
    },
  },
]
