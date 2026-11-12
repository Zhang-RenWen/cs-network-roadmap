import { stepRefsByTopic } from '../../lib/roadmapIndex'
import type { Group } from '../../types'

interface Props {
  group: Group
  index?: number
  matches: Set<string> | null
  onOpenTopic: (id: string) => void
}

export function GroupCard({ group, index, matches, onOpenTopic }: Props) {
  const topicIds = group.sections.flatMap((s) => s.topics.map((t) => t.id))
  const hitCount = matches ? topicIds.filter((id) => matches.has(id)).length : topicIds.length
  const dim = matches !== null && hitCount === 0

  return (
    <article className={`group-card zone-${group.zone}${dim ? ' is-dim' : ''}`} aria-labelledby={`group-${group.id}`}>
      <header className="group-head">
        {index !== undefined && <span className="group-index">{index}</span>}
        <h3 id={`group-${group.id}`}>{group.title}</h3>
        {matches && <span className="group-count">{hitCount} 個符合</span>}
      </header>
      <p className="group-summary">{group.summary}</p>
      {group.host && (
        <p className="host-line">
          <span className="host-label">宿主</span>
          <span>{group.host}</span>
        </p>
      )}

      {group.sections.map((section, i) => (
        <div className="topic-section" key={section.title ?? i}>
          {section.title && <h4 className="section-title">{section.title}</h4>}
          {section.note && <p className="section-note">{section.note}</p>}
          <ul className={`chip-list${section.flow ? ' is-flow' : ''}`}>
            {section.topics.map((topic) => {
              const hit = matches?.has(topic.id)
              const inJourney = stepRefsByTopic.has(topic.id)
              const cls = [
                'chip',
                `zone-${group.zone}`,
                topic.mono ? 'chip--mono' : '',
                matches ? (hit ? 'is-hit' : 'is-dim') : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <li key={topic.id}>
                  <button type="button" className={cls} onClick={() => onOpenTopic(topic.id)} aria-haspopup="dialog">
                    {topic.title}
                    {inJourney && (
                      <span className="chip-journey" title="出現在封包旅程">
                        <span className="visually-hidden">（出現在封包旅程）</span>
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </article>
  )
}
