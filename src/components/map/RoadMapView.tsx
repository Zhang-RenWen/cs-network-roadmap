import { Fragment, useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { groups, ROADMAP_SUBTITLE, ROADMAP_TITLE } from '../../data/roadmap'
import { getScenario, scenarioParam } from '../../data/scenarios'
import { UPCOMING, upcomingCount } from '../../data/upcoming'
import type { Navigate } from '../../hooks/useHashRoute'
import { allTopicEntries, getTopic, searchTopics } from '../../lib/roadmapIndex'
import type { Zone } from '../../types'
import { Icon } from '../Icon'
import { GroupCard } from './GroupCard'
import { TopicDetail } from './TopicDetail'

interface Props {
  topicId?: string
  navigate: Navigate
}

const ZONE_LEGEND: { zone: Zone; label: string }[] = [
  { zone: 'path', label: '請求路徑' },
  { zone: 'cross', label: '橫切關注' },
  { zone: 'knowledge', label: '供應商與知識' },
]

const byZone = (zone: Zone) => groups.filter((g) => g.zone === zone)

export function RoadMapView({ topicId, navigate }: Props) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const upcomingRef = useRef<HTMLElement>(null)
  const matches = useMemo(() => searchTopics(query), [query])
  const entry = getTopic(topicId)

  const openTopic = useCallback((id: string) => navigate({ view: 'map', topicId: id }), [navigate])
  const closeTopic = useCallback(() => navigate({ view: 'map' }), [navigate])
  const openStep = useCallback(
    (scenarioId: string, index: number) =>
      navigate({ view: 'journey', scenario: scenarioParam(getScenario(scenarioId)), step: String(index + 1) }),
    [navigate],
  )

  // 「/」快速聚焦搜尋
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (e.key === '/' && !target?.closest('input, textarea') && !entry) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entry])

  const pathGroups = byZone('path').filter((g) => !g.parent)
  const basicGroups = byZone('path').filter((g) => g.parent)

  return (
    <div className="roadmap">
      <header className="page-head hero">
        <p className="eyebrow">cs-network-roadmap</p>
        <h1>{ROADMAP_TITLE}</h1>
        <p className="page-sub">{ROADMAP_SUBTITLE}</p>
        <p className="hero-intro">
          主軸是一個請求從使用者走到資料的路徑，由外而內排列；之後是每層都會碰到的「橫切關注」，最後是不屬於架構的知識與工具。
          <strong>宿主</strong>＝這個東西跑在什麼上面、由誰承載。點任何一個知識點看說明。
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#/journey/1">
            <Icon name="route" size={15} />
            看一個 HTTPS 請求怎麼走
          </a>
          <span className="hero-stat">
            {groups.length} 個分類 · {allTopicEntries.length} 個知識點
            {upcomingCount > 0 && (
              <>
                {' · '}
                <button
                  type="button"
                  className="hero-upcoming"
                  onClick={() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  還有 {upcomingCount} 個整理中
                </button>
              </>
            )}
          </span>
        </div>
      </header>

      <div className="toolbar">
        <label className="search">
          <Icon name="search" />
          <span className="visually-hidden">搜尋知識點</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="搜尋知識點，例如 TLS、5432、Keycloak…（按 / 聚焦）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <p className="search-status" aria-live="polite">
          {matches ? `找到 ${matches.size} 個知識點` : ''}
        </p>
        <ul className="zone-legend" aria-label="顏色說明">
          {ZONE_LEGEND.map(({ zone, label }) => (
            <li key={zone} className={`zone-${zone}`}>
              <span className="swatch" aria-hidden="true" />
              {label}
            </li>
          ))}
          <li>
            <span className="chip-journey" aria-hidden="true" />
            出現在封包旅程
          </li>
        </ul>
      </div>

      <div className="roadmap-grid">
        <section className="roadmap-path" aria-labelledby="zone-path">
          <h2 id="zone-path" className="zone-heading">
            請求路徑（由外而內）
          </h2>
          {pathGroups.map((g, i) => (
            <Fragment key={g.id}>
              <GroupCard group={g} index={i + 1} matches={matches} onOpenTopic={openTopic} />
              {i < pathGroups.length - 1 && <div className="path-arrow" aria-hidden="true" />}
            </Fragment>
          ))}
        </section>

        <section className="roadmap-side" aria-labelledby="zone-basics">
          <h2 id="zone-basics" className="zone-heading">
            共通基礎（整條路徑都會用到）
          </h2>
          {basicGroups.map((g) => (
            <GroupCard key={g.id} group={g} matches={matches} onOpenTopic={openTopic} />
          ))}
        </section>
      </div>

      <section className="roadmap-band" aria-labelledby="zone-cross">
        <h2 id="zone-cross" className="zone-heading">
          橫切關注（每一層都會碰到）
        </h2>
        <div className="band-grid band-grid--3">
          {byZone('cross').map((g) => (
            <GroupCard key={g.id} group={g} matches={matches} onOpenTopic={openTopic} />
          ))}
        </div>
      </section>

      <section className="roadmap-band" aria-labelledby="zone-knowledge">
        <h2 id="zone-knowledge" className="zone-heading">
          供應商與知識
        </h2>
        <div className="band-grid band-grid--4">
          {byZone('knowledge').map((g) => (
            <GroupCard key={g.id} group={g} matches={matches} onOpenTopic={openTopic} />
          ))}
        </div>
      </section>

      {upcomingCount > 0 && (
        <section ref={upcomingRef} className="roadmap-band upcoming" aria-labelledby="zone-upcoming">
          <h2 id="zone-upcoming" className="zone-heading">
            即將加入
          </h2>
          <div className="upcoming-card">
            <div className="upcoming-head">
              <span className="upcoming-badge">整理中</span>
              <h3>系統變大之後會遇到的事</h3>
            </div>
            <p className="upcoming-lead">
              服務拆成很多個、流量變大之後，才會碰到的 {upcomingCount} 個主題。內容正在整理，之後會加進地圖。
            </p>
            <div className="upcoming-grid">
              {UPCOMING.map((area) => (
                <div key={area.area} className="upcoming-area">
                  <h4>{area.area}</h4>
                  <ul>
                    {area.topics.map((t) => (
                      <li key={t.title}>
                        <strong>{t.title}</strong>
                        <span>{t.summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {entry && <TopicDetail entry={entry} onClose={closeTopic} onOpenTopic={openTopic} onOpenStep={openStep} />}
    </div>
  )
}
