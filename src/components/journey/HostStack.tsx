import { useId } from 'react'
import type { JourneyNode } from '../../types'

interface Props {
  node: JourneyNode
  active: number | number[]
}

export function HostStack({ node, active }: Props) {
  const actives = new Set(Array.isArray(active) ? active : [active])
  const tall = node.stack.length >= 5
  const titleId = useId()

  return (
    <section className="panel stack-panel" aria-labelledby={titleId}>
      <h3 id={titleId} className="panel-title">
        這台機器裡的層：宿主鏈
        <span className="panel-sub">{node.label} · 由下往上，一層承載一層</span>
      </h3>
      {/* DOM 順序由下往上（螢幕閱讀器也是），畫面用 column-reverse 讓底層在下面 */}
      <ol className={`hoststack${tall ? ' is-tall' : ''}`}>
        {node.stack.map((layer, i) => {
          const on = actives.has(i)
          return (
            <li key={`${i}-${layer}`} className={on ? 'is-active' : undefined} aria-current={on ? 'true' : undefined}>
              <span className="hs-index">{i + 1}</span>
              <span className="hs-text">{layer}</span>
              {on && <span className="hs-here">現在在這層</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
