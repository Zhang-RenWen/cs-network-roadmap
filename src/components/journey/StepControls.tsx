import { isFirstStep, isLastStep } from '../../lib/stepNav'
import type { Step } from '../../types'
import { Icon } from '../Icon'

interface Props {
  steps: Step[]
  index: number
  playing: boolean
  onJump: (index: number) => void
  onTogglePlay: () => void
}

export function StepControls({ steps, index, playing, onJump, onTogglePlay }: Props) {
  const total = steps.length
  return (
    <div className="controls" role="group" aria-label="步驟控制">
      <div className="controls-buttons">
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => onJump(index - 1)}
          disabled={isFirstStep(index)}
          aria-label="上一步"
        >
          <Icon name="prev" />
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onTogglePlay}
          aria-pressed={playing}
          aria-label={playing ? '暫停自動播放' : '自動播放'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={14} />
          {playing ? '暫停' : '播放'}
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => onJump(index + 1)}
          disabled={isLastStep(index, total)}
          aria-label="下一步"
        >
          <Icon name="next" />
        </button>
        <span className="counter" data-testid="step-counter">
          {index + 1} / {total}
        </span>
      </div>

      <ol className="progress" aria-label="所有步驟">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={i === index ? 'is-current' : i < index ? 'is-done' : undefined}
              onClick={() => onJump(i)}
              aria-label={`第 ${i + 1} 站：${s.title}`}
              aria-current={i === index ? 'step' : undefined}
              title={`${i + 1}. ${s.title}`}
            />
          </li>
        ))}
      </ol>

      <p className="kbd-hint">
        <kbd>←</kbd> <kbd>→</kbd> 切換 · <kbd>空白鍵</kbd> 播放 · 點插圖上的機器直接跳過去
      </p>
    </div>
  )
}
