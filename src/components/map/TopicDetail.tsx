import { useEffect, useRef } from 'react'
import { scenarios } from '../../data/scenarios'
import { getTopic, stepRefsByTopic, type TopicEntry } from '../../lib/roadmapIndex'
import { Icon } from '../Icon'

interface Props {
  entry: TopicEntry
  onClose: () => void
  onOpenTopic: (id: string) => void
  onOpenStep: (scenarioId: string, index: number) => void
}

const scenarioTab = new Map(scenarios.map((s) => [s.id, s.tab]))

export function TopicDetail({ entry, onClose, onOpenTopic, onOpenStep }: Props) {
  const { topic, group, section } = entry
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const steps = stepRefsByTopic.get(topic.id) ?? []
  const related = (topic.related ?? []).map(getTopic).filter((t) => t !== undefined)

  useEffect(() => {
    closeRef.current?.focus()
    if (panelRef.current) panelRef.current.scrollTop = 0
  }, [topic.id])

  // 關閉後把焦點還給打開它的按鈕
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    return () => {
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={`drawer zone-${group.zone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-title"
      >
        <div className="drawer-head">
          <p className="crumb">
            {group.title}
            {section.title && <> › {section.title}</>}
          </p>
          <button ref={closeRef} type="button" className="btn btn-icon" onClick={onClose} aria-label="關閉">
            <Icon name="close" />
          </button>
        </div>

        <h2 id="topic-title" className={`drawer-title${topic.mono ? ' is-mono' : ''}`}>
          {topic.title}
        </h2>
        <p className="drawer-lead">{topic.summary}</p>

        {topic.host && (
          <div className="host-block">
            <span className="host-label">宿主</span>
            <p>{topic.host}</p>
          </div>
        )}

        {topic.tags && topic.tags.length > 0 && (
          <ul className="tag-row" aria-label="相關工具與關鍵字">
            {topic.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        )}

        {topic.details && topic.details.length > 0 && (
          <ul className="detail-list">
            {topic.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        {topic.tables?.map((table, i) => (
          <div className="table-wrap" key={table.caption ?? i}>
            <table>
              {table.caption && <caption>{table.caption}</caption>}
              <thead>
                <tr>
                  {table.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.join('|')}>
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={j}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {steps.length > 0 && (
          <section className="drawer-section">
            <h3>
              <Icon name="route" /> 在封包旅程中
            </h3>
            <ul className="step-links">
              {steps.map((s) => (
                <li key={`${s.scenarioId}-${s.index}`}>
                  <button type="button" onClick={() => onOpenStep(s.scenarioId, s.index)}>
                    <span className="step-no">{s.index + 1}</span>
                    <span>
                      {s.title}
                      <small>
                        {scenarios.length > 1 && <>{scenarioTab.get(s.scenarioId)} · </>}
                        {s.nodeLabel}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {topic.links && topic.links.length > 0 && (
          <section className="drawer-section">
            <h3>延伸閱讀</h3>
            <ul className="ext-links">
              {topic.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label} <Icon name="external" size={14} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="drawer-section">
            <h3>相關知識點</h3>
            <ul className="chip-row">
              {related.map(({ topic: r, group: g }) => (
                <li key={r.id}>
                  <button type="button" className={`chip zone-${g.zone}`} onClick={() => onOpenTopic(r.id)}>
                    {r.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

      </aside>
    </div>
  )
}
