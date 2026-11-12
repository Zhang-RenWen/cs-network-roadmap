import { groups } from '../data/roadmap'
import { scenarios } from '../data/scenarios'
import type { Group, Topic, TopicSection } from '../types'

export interface TopicEntry {
  topic: Topic
  group: Group
  section: TopicSection
}

export interface StepRef {
  scenarioId: string
  index: number
  title: string
  nodeLabel: string
}

export const allTopicEntries: TopicEntry[] = groups.flatMap((group) =>
  group.sections.flatMap((section) => section.topics.map((topic) => ({ topic, group, section }))),
)

const topicIndex = new Map(allTopicEntries.map((entry) => [entry.topic.id, entry]))

export const getTopic = (id: string | undefined) => (id ? topicIndex.get(id) : undefined)

/** 知識點 → 封包旅程中提到它的步驟 */
export const stepRefsByTopic = new Map<string, StepRef[]>()
for (const scenario of scenarios) {
  const nodeLabel = new Map(scenario.nodes.map((n) => [n.id, n.label]))
  scenario.steps.forEach((step, index) => {
    for (const topicId of step.topics ?? []) {
      const refs = stepRefsByTopic.get(topicId) ?? []
      refs.push({ scenarioId: scenario.id, index, title: step.title, nodeLabel: nodeLabel.get(step.node) ?? step.node })
      stepRefsByTopic.set(topicId, refs)
    }
  })
}

const normalize = (s: string) => s.normalize('NFKC').toLowerCase()

const haystacks = new Map(
  allTopicEntries.map(({ topic, group, section }) => [
    topic.id,
    normalize(
      [
        topic.title,
        topic.summary,
        topic.host,
        ...(topic.tags ?? []),
        ...(topic.details ?? []),
        ...(topic.tables ?? []).flatMap((t) => t.rows.flat()),
        group.title,
        section.title,
      ]
        .filter(Boolean)
        .join(' '),
    ),
  ]),
)

/** 回傳符合的知識點 id；查詢字串為空時回傳 null（代表不篩選） */
export function searchTopics(query: string): Set<string> | null {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return null
  const hits = new Set<string>()
  for (const [id, text] of haystacks) {
    if (terms.every((term) => text.includes(term))) hits.add(id)
  }
  return hits
}
