import { describe, expect, it } from 'vite-plus/test'
import { agentTools, createAgent } from '../../src/agent'

describe('agent tools', () => {
  it('should describe the three calls as objects a model can be handed', () => {
    expect(agentTools.map((tool) => tool.name)).toEqual(['snapshot', 'act', 'query'])

    for (const tool of agentTools) {
      expect(tool.description.length).toBeGreaterThan(0)
      expect(tool.inputSchema).toMatchObject({ type: 'object' })
    }
  })

  it('should say that an act needs steps', () => {
    const act = agentTools.find((tool) => tool.name === 'act')

    expect(act?.inputSchema).toMatchObject({ required: ['steps'] })
  })

  it('should name each tool after the method that runs it', () => {
    const agent = createAgent()

    expect(agent.tools).toBe(agentTools)

    for (const tool of agentTools) {
      expect(typeof agent[tool.name]).toBe('function')
    }
  })
})
