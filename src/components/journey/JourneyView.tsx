import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { AUTOPLAY_DELAY } from '../../config'
import { scenarioParam, scenarios } from '../../data/scenarios'
import { routeToHash } from '../../hooks/useHashRoute'
import { useFitZoom } from '../../hooks/useFitZoom'
import type { Navigate } from '../../hooks/useHashRoute'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { clampStep, isLastStep, stepAtNode, stepFromParam } from '../../lib/stepNav'
import type { Scenario } from '../../types'
import { JourneyLegend, JourneyMap } from './JourneyMap'
import { StepPart, StepStack } from './JourneyPanels'
import { StepControls } from './StepControls'

/** 符合畫面時，中間一欄與右邊一欄放的面板 */
const MIDDLE_PARTS = ['step', 'host'] as const
const SIDE_PARTS = ['layers'] as const

interface Props {
  scenario: Scenario
  stepParam?: string
  navigate: Navigate
  /** 符合畫面：改成三欄並等比例縮放，一個畫面看完（手機直式不套用） */
  fit?: boolean
}

export function JourneyView({ scenario, stepParam, navigate, fit = false }: Props) {
  const total = scenario.steps.length
  const index = stepFromParam(stepParam, total)
  const step = scenario.steps[index]
  const node = scenario.nodes.find((n) => n.id === step.node)!
  const [playing, setPlaying] = useState(false)
  const fitActive = useMediaQuery('(min-width: 721px)') && fit
  const { ref: fitRef, zoom } = useFitZoom<HTMLDivElement>(fitActive)

  const go = useCallback(
    (i: number) =>
      navigate(
        { view: 'journey', scenario: scenarioParam(scenario), step: String(clampStep(i, total) + 1) },
        { replace: true },
      ),
    [navigate, scenario, total],
  )

  const togglePlay = useCallback(() => {
    if (!playing && isLastStep(index, total)) go(0)
    setPlaying((p) => !p)
  }, [playing, index, total, go])

  // 自動播放：每一步停留一段時間；走到最後一步就停
  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => {
      if (isLastStep(index, total)) setPlaying(false)
      else go(index + 1)
    }, AUTOPLAY_DELAY)
    return () => window.clearTimeout(timer)
  }, [playing, index, total, go])

  // 鍵盤：← → 切換、Home / End 跳到頭尾、空白鍵播放
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          go(index + 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          go(index - 1)
          break
        case 'Home':
          e.preventDefault()
          go(0)
          break
        case 'End':
          e.preventDefault()
          go(total - 1)
          break
        case ' ':
          if (target?.closest('button, a, [role="button"]')) return
          e.preventDefault()
          togglePlay()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, go, togglePlay])

  const head = (
    <header className="page-head">
      <p className="eyebrow">封包旅程 Packet Journey</p>
      {scenarios.length > 1 && (
        <nav className="scenario-tabs" aria-label="情境">
          {scenarios.map((s) => (
            <a
              key={s.id}
              href={routeToHash({ view: 'journey', scenario: scenarioParam(s) })}
              className={s.id === scenario.id ? 'is-active' : undefined}
              aria-current={s.id === scenario.id ? 'page' : undefined}
            >
              {s.tab}
            </a>
          ))}
        </nav>
      )}
      <h1>{scenario.title}</h1>
      <p className="page-sub">{scenario.subtitle}</p>
      <p className="disclaimer">{scenario.disclaimer}</p>
    </header>
  )

  const stage = (
    <div className="card stage">
      <JourneyMap
        scenario={scenario}
        stepIndex={index}
        onSelectNode={(nodeId) => go(stepAtNode(scenario.steps, index, nodeId))}
      />
      <JourneyLegend />
    </div>
  )

  const controls = (
    <StepControls steps={scenario.steps} index={index} playing={playing} onJump={go} onTogglePlay={togglePlay} />
  )

  const live = (
    <p className="visually-hidden" aria-live="polite">
      第 {index + 1} 站，共 {total} 站：{node.label}，{step.title}
    </p>
  )

  if (!fitActive) {
    return (
      <div className="journey-fit" ref={fitRef}>
        <div className="journey">
          {head}
          {stage}
          {controls}
          {live}
          <div className="journey-grid">
            <StepPart scenario={scenario} index={index} part="step" />
            <StepPart scenario={scenario} index={index} part="layers" />
            <StepPart scenario={scenario} index={index} part="host" />
          </div>
        </div>
      </div>
    )
  }

  // 符合畫面：三欄。左欄插圖 + 控制列，中間這一站的說明 + 宿主鏈，右邊封包信封
  return (
    <div className="journey-fit" ref={fitRef}>
      <div className="journey is-fit" style={{ '--fit-zoom': zoom } as CSSProperties}>
        <div className="journey-col">
          {head}
          {stage}
          {controls}
          {live}
        </div>
        <StepStack scenario={scenario} index={index} parts={MIDDLE_PARTS} />
        <StepStack scenario={scenario} index={index} parts={SIDE_PARTS} />
      </div>
    </div>
  )
}
