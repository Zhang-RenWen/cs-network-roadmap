import type { KeyboardEvent } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import {
  approxTextWidth,
  labelPosition,
  NODE_BOUNDS,
  packetPosition,
  pointsToPath,
  segmentPoints,
} from '../../lib/geometry'
import type { Scenario } from '../../types'
import { MachineIcon } from './MachineIcon'

interface Props {
  scenario: Scenario
  stepIndex: number
  onSelectNode: (nodeId: string) => void
}

const LABEL_SIZE = 12

function LockGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g className="lock-glyph" transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x={-4.5} y={-3} width={9} height={7} rx={1.5} />
      <path d="M-2.6 -3V-5a2.6 2.6 0 0 1 5.2 0V-3" />
    </g>
  )
}

export function JourneyMap({ scenario, stepIndex, onSelectNode }: Props) {
  const narrow = useMediaQuery('(max-width: 640px)')
  const layout = narrow ? scenario.layouts.narrow : scenario.layouts.wide
  const step = scenario.steps[stepIndex]
  const activeSegments = new Set(step.segments ?? [])
  const currentNode = scenario.nodes.find((n) => n.id === step.node)!
  const currentPlacement = layout.nodes[currentNode.id]
  const packet = packetPosition(
    currentNode.kind,
    currentPlacement,
    currentPlacement.packetSide ?? layout.packetSide,
  )

  const handleKey = (e: KeyboardEvent, nodeId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectNode(nodeId)
    }
  }

  return (
    <svg
      className={`jmap ${narrow ? 'is-narrow' : 'is-wide'}`}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="group"
      aria-label="請求路徑插圖：點機器可以跳到那一站"
    >
      {/* 區域：你家 LAN、VPC、Subnet */}
      {layout.zones.map((z) => (
        <g key={z.id} className={`zone zone--${z.tone}`}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} />
          <text x={z.labelPos.x} y={z.labelPos.y} textAnchor={z.labelPos.anchor ?? 'start'}>
            {z.label}
          </text>
        </g>
      ))}

      {/* 線段：TLS 加密段有半透明的「隧道」底色 */}
      {scenario.segments.map((seg) => {
        const d = pointsToPath(segmentPoints(seg, layout))
        return (
          <g key={seg.id} className={`seg seg--${seg.kind}`}>
            {seg.kind === 'tls' && <path className="seg-band" d={d} />}
            <path className="seg-line" d={d} />
          </g>
        )
      })}

      {/* 這一步封包正在走的線段 */}
      {scenario.segments
        .filter((seg) => activeSegments.has(seg.id))
        .map((seg) => (
          <path
            key={`${seg.id}-${stepIndex}`}
            className={`seg-flow seg-flow--${seg.kind}${step.direction === 'back' ? ' is-back' : ''}`}
            d={pointsToPath(segmentPoints(seg, layout))}
          />
        ))}

      {/* 加密 / 明文區段標籤 */}
      {scenario.tunnels.map((t) => {
        const pos = layout.tunnelLabels[t.id]
        if (!pos) return null
        const anchor = pos.anchor ?? 'middle'
        const lockWidth = t.kind === 'tls' ? 14 : 0
        const groupWidth = approxTextWidth(t.label, LABEL_SIZE) + lockWidth
        const start = anchor === 'start' ? pos.x : anchor === 'end' ? pos.x - groupWidth : pos.x - groupWidth / 2
        return (
          <g key={t.id} className={`tunnel tunnel--${t.kind}`}>
            <title>{t.description}</title>
            {pos.bracket && (
              <path
                className="tunnel-bracket"
                d={`M${pos.bracket.x1 + 6} ${pos.bracket.y + 7}V${pos.bracket.y}H${pos.bracket.x2 - 6}V${pos.bracket.y + 7}`}
              />
            )}
            {t.kind === 'tls' && <LockGlyph x={start + 5} y={pos.y - 4} />}
            <text className="tunnel-label" x={start + lockWidth} y={pos.y} textAnchor="start">
              {t.label}
            </text>
          </g>
        )
      })}

      {scenario.segments.map((seg) => {
        const pos = layout.segmentLabels?.[seg.id]
        if (!pos || !seg.label) return null
        return (
          <text
            key={`label-${seg.id}`}
            className={`seg-label seg-label--${seg.kind}`}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.anchor ?? 'middle'}
          >
            {seg.label}
          </text>
        )
      })}

      {/* 機器 */}
      {scenario.nodes.map((n) => {
        const p = layout.nodes[n.id]
        const b = NODE_BOUNDS[n.kind]
        const isActive = n.id === step.node
        const lp = p.label
          ? { x: p.label.x, y: p.label.y, anchor: p.label.anchor ?? 'start' }
          : labelPosition(n.kind, p, p.labelSide ?? layout.labelSide)
        return (
          <g
            key={n.id}
            className={`jnode jnode--${n.kind}${isActive ? ' is-active' : ''}`}
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${n.label}：跳到這一站`}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onSelectNode(n.id)}
            onKeyDown={(e) => handleKey(e, n.id)}
          >
            <rect
              className="jnode-hit"
              x={-b.hw - 6}
              y={-b.top - 6}
              width={b.hw * 2 + 12}
              height={b.top + b.bottom + 12}
              rx={8}
            />
            <MachineIcon kind={n.kind} />
            <text className="jnode-label" x={lp.x - p.x} y={lp.y - p.y} textAnchor={lp.anchor}>
              {n.label}
            </text>
          </g>
        )
      })}

      {/* 封包 */}
      <g className="packet" style={{ transform: `translate(${packet.x}px, ${packet.y}px)` }} aria-hidden="true">
        <circle className="packet-halo" r={15} />
        <rect className="packet-body" x={-9} y={-6.5} width={18} height={13} rx={2.5} />
        <path className="packet-flap" d="M-8 -5L0 1.5L8 -5" />
      </g>
    </svg>
  )
}

export function JourneyLegend() {
  return (
    <ul className="jlegend" aria-label="圖例">
      <li>
        <svg width="34" height="12" aria-hidden="true">
          <path className="legend-band" d="M3 6H31" />
          <path className="legend-tls" d="M3 6H31" />
        </svg>
        TLS 加密
      </li>
      <li>
        <svg width="34" height="12" aria-hidden="true">
          <path className="legend-plain" d="M3 6H31" />
        </svg>
        HTTP 明文
      </li>
      <li>
        <svg width="34" height="12" aria-hidden="true">
          <path className="legend-dns" d="M3 6H31" />
        </svg>
        DNS 查詢（UDP）
      </li>
      <li>
        <svg width="34" height="12" aria-hidden="true">
          <path className="legend-db" d="M3 6H31" />
        </svg>
        資料庫連線
      </li>
      <li>
        <svg width="20" height="14" aria-hidden="true">
          <rect className="packet-body" x="1" y="1" width="18" height="12" rx="2.5" />
          <path className="packet-flap" d="M2 2.5L10 8.5L18 2.5" />
        </svg>
        封包目前位置
      </li>
    </ul>
  )
}
