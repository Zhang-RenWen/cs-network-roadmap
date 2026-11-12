import { useId } from 'react'
import { LAYER_META, LAYER_ORDER, parseLayerCode, STATE_META } from '../../lib/layers'
import type { LayerId, LayerState, Step } from '../../types'
import { Icon } from '../Icon'

interface Props {
  step: Step
  defaults: Record<LayerId, string>
}

export function PacketLayers({ step, defaults }: Props) {
  const titleId = useId()
  const states = parseLayerCode(step.layers)

  const renderLayer = (depth: number) => {
    const id = LAYER_ORDER[depth]
    if (!id) return null
    const state = states[id]
    const meta = LAYER_META[id]
    const field = state === 'n' ? null : (step.fields?.[id] ?? defaults[id])
    // TLS 層本身描述「這裡有加密」，內容照常顯示；被加密包住的內容則模糊處理
    const veiled = state === 'e' && id !== 'tls'
    return (
      <div className={`env env--${id} st-${state}`} data-layer={id} data-state={state}>
        <div className="env-head">
          <span className="env-tag">{meta.tag}</span>
          <span className="env-name">
            {step.layerNames?.[id] ?? meta.name}
            <span className="env-hint">{meta.hint}</span>
          </span>
          <span className={`state-chip st-${state}`}>
            <Icon name={STATE_META[state].icon} size={13} />
            {STATE_META[state].label}
          </span>
        </div>
        {field && (
          <div className={`env-field${veiled ? ' is-veiled' : ''}`}>
            <code aria-hidden={veiled || undefined}>{field}</code>
            {veiled && (
              <span className="env-veil">
                <Icon name="lock" size={14} />
                內容被加密，這一站看不到
              </span>
            )}
          </div>
        )}
        {renderLayer(depth + 1)}
      </div>
    )
  }

  return (
    <section className="panel layers-panel" aria-labelledby={titleId}>
      <h3 id={titleId} className="panel-title">
        封包現在長這樣
        <span className="panel-sub">外層 → 內層，像信封一層包一層</span>
      </h3>
      <div className="envelope">{renderLayer(0)}</div>
      <ul className="state-legend" aria-label="狀態說明">
        {(Object.keys(STATE_META) as LayerState[]).map((s) => (
          <li key={s} className={`state-chip st-${s}`}>
            <Icon name={STATE_META[s].icon} size={13} />
            {STATE_META[s].label}
          </li>
        ))}
      </ul>
    </section>
  )
}
