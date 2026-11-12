import type { Anchor, Layout, MachineKind, NodePlacement, Segment, Side } from '../types'

export interface Point {
  x: number
  y: number
}

/** 每種機器插圖相對中心點的範圍（半寬、上緣、下緣） */
export const NODE_BOUNDS: Record<MachineKind, { hw: number; top: number; bottom: number }> = {
  laptop: { hw: 34, top: 24, bottom: 21 },
  dns: { hw: 28, top: 17, bottom: 17 },
  router: { hw: 30, top: 28, bottom: 16 },
  internet: { hw: 42, top: 26, bottom: 20 },
  edge: { hw: 22, top: 26, bottom: 27 },
  firewall: { hw: 22, top: 20, bottom: 20 },
  loadbalancer: { hw: 28, top: 20, bottom: 20 },
  server: { hw: 30, top: 34, bottom: 34 },
  database: { hw: 24, top: 25, bottom: 25 },
}

export function labelPosition(kind: MachineKind, p: NodePlacement, side: Side): Point & { anchor: Anchor } {
  const b = NODE_BOUNDS[kind]
  switch (side) {
    case 'above':
      return { x: p.x, y: p.y - b.top - 8, anchor: 'middle' }
    case 'left':
      return { x: p.x - b.hw - 10, y: p.y + 4, anchor: 'end' }
    case 'right':
      return { x: p.x + b.hw + 10, y: p.y + 4, anchor: 'start' }
    default:
      return { x: p.x, y: p.y + b.bottom + 18, anchor: 'middle' }
  }
}

const PACKET_GAP = 18

export function packetPosition(kind: MachineKind, p: NodePlacement, side: Side): Point {
  const b = NODE_BOUNDS[kind]
  switch (side) {
    case 'left':
      return { x: p.x - b.hw - PACKET_GAP, y: p.y }
    case 'right':
      return { x: p.x + b.hw + PACKET_GAP, y: p.y }
    case 'below':
      return { x: p.x, y: p.y + b.bottom + PACKET_GAP }
    default:
      return { x: p.x, y: p.y - b.top - PACKET_GAP }
  }
}

export function segmentPoints(segment: Segment, layout: Layout): Point[] {
  const from = layout.nodes[segment.from]
  const to = layout.nodes[segment.to]
  if (!from || !to) return []
  return [{ x: from.x, y: from.y }, ...(layout.via?.[segment.id] ?? []), { x: to.x, y: to.y }]
}

export const pointsToPath = (points: Point[]) =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

/** 粗估文字寬度（中日韓字元約一個字寬，其他約 0.6 個字寬） */
export function approxTextWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) w += ch.codePointAt(0)! > 0x2e80 ? fontSize : fontSize * 0.6
  return w
}
