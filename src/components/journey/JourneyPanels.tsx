import { memo, useId } from 'react'
import { getTopic } from '../../lib/roadmapIndex'
import type { JourneyNode, Scenario, Step } from '../../types'
import { HostStack } from './HostStack'
import { PacketLayers } from './PacketLayers'

/** 跟著步驟變的三個面板：這一站在做什麼、封包長相、宿主鏈 */
export type PanelPart = 'step' | 'layers' | 'host'

export function StepPart({ scenario, index, part }: { scenario: Scenario; index: number; part: PanelPart }) {
  const step = scenario.steps[index]
  const node = scenario.nodes.find((n) => n.id === step.node)!
  switch (part) {
    case 'step':
      return <StepPanel step={step} node={node} index={index} />
    case 'layers':
      return <PacketLayers step={step} defaults={scenario.defaultFields} />
    case 'host':
      return <HostStack node={node} active={step.hostLayer} />
  }
}

interface StackProps {
  scenario: Scenario
  index: number
  /** 這一格由上往下放哪些面板；請傳模組層級的常數，隱藏副本才不會每一步都重新渲染 */
  parts: readonly PanelPart[]
}

/**
 * 符合畫面用：目前這一站的面板，加上每一站各一份隱藏副本疊在同一格。
 * 格子高度取最高的那一站，切換步驟時格子大小和縮放比例都不會跳。
 */
export function StepStack({ scenario, index, parts }: StackProps) {
  return (
    <div className={`step-stack step-stack--${parts.join('-')}`}>
      <div className="step-stack-item">
        {parts.map((part) => (
          <StepPart key={part} scenario={scenario} index={index} part={part} />
        ))}
      </div>
      <StackGhosts scenario={scenario} parts={parts} />
    </div>
  )
}

/** 隱藏副本只跟情境有關，切換步驟時不重新渲染；輔助技術與鍵盤都碰不到 */
const StackGhosts = memo(function StackGhosts({ scenario, parts }: Omit<StackProps, 'index'>) {
  return scenario.steps.map((s, i) => (
    <div key={s.id} className="step-stack-item step-ghost" aria-hidden="true" inert>
      {parts.map((part) => (
        <StepPart key={part} scenario={scenario} index={i} part={part} />
      ))}
    </div>
  ))
})

function StepPanel({ step, node, index }: { step: Step; node: JourneyNode; index: number }) {
  const titleId = useId()
  const topics = (step.topics ?? []).map(getTopic).filter((t) => t !== undefined)

  return (
    <section className="panel step-panel" aria-labelledby={titleId}>
      <p className="step-kicker">
        第 {index + 1} 站 · {node.label}
      </p>
      <h2 id={titleId} className="step-title">
        {step.title}
      </h2>
      <p className="step-desc">{step.description}</p>
      {step.note && (
        <p className="step-note">
          <strong>典型設定，實際依環境而定</strong>
          {step.note}
        </p>
      )}

      <h3 className="mini-title">宿主是誰、軟體誰維護、你要做什麼</h3>
      <dl className="owner">
        <div>
          <dt>實體機器</dt>
          <dd>{node.owner.machine}</dd>
        </div>
        <div>
          <dt>軟體維護</dt>
          <dd>{node.owner.software}</dd>
        </div>
        <div>
          <dt>你要做的事</dt>
          <dd>{node.owner.you}</dd>
        </div>
      </dl>

      {topics.length > 0 && (
        <>
          <h3 className="mini-title">在世界地圖上</h3>
          <ul className="chip-row">
            {topics.map(({ topic, group }) => (
              <li key={topic.id}>
                <a className={`chip chip--link zone-${group.zone}`} href={`#/map/${topic.id}`}>
                  {topic.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
