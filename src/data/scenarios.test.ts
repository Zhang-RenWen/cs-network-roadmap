import { describe, expect, it } from 'vitest'
import { getTopic } from '../lib/roadmapIndex'
import type { LayerState } from '../types'
import { scenarios } from './scenarios'

const STATES: LayerState[] = ['h', 's', 'e', 'o', 'r', 'n']

describe.each(scenarios.map((s) => [s.id, s] as const))('情境 %s 資料完整性', (_, scenario) => {
  const nodeIds = new Set(scenario.nodes.map((n) => n.id))
  const segmentIds = new Set(scenario.segments.map((s) => s.id))
  const tunnelIds = new Set(scenario.tunnels.map((t) => t.id))

  it('節點、線段、步驟的 id 都不重複', () => {
    expect(nodeIds.size).toBe(scenario.nodes.length)
    expect(segmentIds.size).toBe(scenario.segments.length)
    expect(new Set(scenario.steps.map((s) => s.id)).size).toBe(scenario.steps.length)
  })

  it('至少有一步，且每一步都有標題與說明', () => {
    expect(scenario.steps.length).toBeGreaterThan(0)
    for (const step of scenario.steps) {
      expect(step.title.trim()).not.toBe('')
      expect(step.description.trim()).not.toBe('')
    }
  })

  it('每一步的機器都存在，每台機器至少出現在一步', () => {
    for (const step of scenario.steps) expect(nodeIds, step.id).toContain(step.node)
    const used = new Set(scenario.steps.map((s) => s.node))
    for (const id of nodeIds) expect(used, id).toContain(id)
  })

  it('五層狀態都是合法代碼', () => {
    for (const step of scenario.steps) {
      expect(step.layers, step.id).toHaveLength(5)
      for (const ch of step.layers) expect(STATES, step.id).toContain(ch)
    }
  })

  it('不存在的層不會有範例內容', () => {
    const order = ['l2', 'l3', 'l4', 'tls', 'l7'] as const
    for (const step of scenario.steps) {
      order.forEach((id, i) => {
        if (step.layers[i] === 'n') expect(step.fields?.[id], `${step.id}.${id}`).toBeUndefined()
      })
    }
  })

  it('TLS 層加密時，裡面的 L7 也看不到', () => {
    for (const step of scenario.steps) {
      if (step.layers[3] === 'e') expect(step.layers[4], step.id).toBe('e')
    }
  })

  it('宿主鏈目前所在的層在範圍內', () => {
    for (const step of scenario.steps) {
      const stack = scenario.nodes.find((n) => n.id === step.node)!.stack
      const layers = Array.isArray(step.hostLayer) ? step.hostLayer : [step.hostLayer]
      expect(layers.length, step.id).toBeGreaterThan(0)
      for (const l of layers) {
        expect(Number.isInteger(l), step.id).toBe(true)
        expect(l, step.id).toBeGreaterThanOrEqual(0)
        expect(l, step.id).toBeLessThan(stack.length)
      }
    }
  })

  it('線段連到存在的機器，也屬於存在的區段', () => {
    for (const seg of scenario.segments) {
      expect(nodeIds, seg.id).toContain(seg.from)
      expect(nodeIds, seg.id).toContain(seg.to)
      if (seg.tunnel) expect(tunnelIds, seg.id).toContain(seg.tunnel)
    }
  })

  it('步驟引用的線段存在', () => {
    for (const step of scenario.steps) {
      for (const id of step.segments ?? []) expect(segmentIds, step.id).toContain(id)
    }
  })

  it('步驟對應的知識點都在 Road Map 裡', () => {
    for (const step of scenario.steps) {
      for (const id of step.topics ?? []) expect(getTopic(id), `${step.id} → ${id}`).toBeDefined()
    }
  })

  it('「這一站壞掉會怎樣」有症狀與說明，連到存在的知識點', () => {
    const withFailure = scenario.steps.filter((s) => s.failure)
    expect(withFailure.length).toBeGreaterThan(scenario.steps.length / 2)
    for (const step of withFailure) {
      expect(step.failure!.symptom.trim(), step.id).not.toBe('')
      expect(step.failure!.detail.trim(), step.id).not.toBe('')
      if (step.failure!.topic) expect(getTopic(step.failure!.topic), `${step.id} → ${step.failure!.topic}`).toBeDefined()
    }
  })

  it('情境有切換列用的短名稱', () => {
    expect(scenario.tab.trim()).not.toBe('')
  })

  it.each(['wide', 'narrow'] as const)('%s 版面有每台機器的位置，且都在畫布內', (key) => {
    const layout = scenario.layouts[key]
    for (const id of nodeIds) {
      const p = layout.nodes[id]
      expect(p, `${key}.${id}`).toBeDefined()
      expect(p.x).toBeGreaterThan(0)
      expect(p.x).toBeLessThan(layout.width)
      expect(p.y).toBeGreaterThan(0)
      expect(p.y).toBeLessThan(layout.height)
    }
    for (const id of Object.keys(layout.tunnelLabels)) expect(tunnelIds, `${key}.${id}`).toContain(id)
    for (const id of Object.keys(layout.via ?? {})) expect(segmentIds, `${key}.${id}`).toContain(id)
    for (const id of Object.keys(layout.segmentLabels ?? {})) expect(segmentIds, `${key}.${id}`).toContain(id)
  })
})
