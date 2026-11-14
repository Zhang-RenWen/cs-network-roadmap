import type { FitPreference } from '../hooks/useFitPreference'
import type { ThemeMode } from '../hooks/useTheme'
import { Icon } from './Icon'

interface Props {
  view: 'map' | 'journey'
  theme: { mode: ThemeMode; cycle: () => void }
  fit: FitPreference
}

const THEME_LABEL: Record<ThemeMode, string> = {
  system: '跟隨系統',
  light: '淺色',
  dark: '深色',
}

export function AppHeader({ view, theme, fit }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="brand" href="#/map">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="13" />
            <path d="M3 16h26 M16 3c-4 4-5.5 8.5-5.5 13s1.5 9 5.5 13 M16 3c4 4 5.5 8.5 5.5 13s-1.5 9-5.5 13" />
            <rect x="19" y="18" width="11" height="8" rx="1.5" />
            <path d="M19.5 18.8l5 3.6 5-3.6" />
          </svg>
          <span>計算機科學、網路世界 Road Map</span>
        </a>

        <nav className="tabs" aria-label="主要頁面">
          <a href="#/map" className={view === 'map' ? 'is-active' : undefined} aria-current={view === 'map' ? 'page' : undefined}>
            <Icon name="map" />
            世界地圖
          </a>
          <a
            href="#/journey"
            className={view === 'journey' ? 'is-active' : undefined}
            aria-current={view === 'journey' ? 'page' : undefined}
          >
            <Icon name="route" />
            封包旅程
          </a>
        </nav>

        {view === 'journey' && (
          <button
            type="button"
            className="btn fit-toggle"
            onClick={fit.toggle}
            aria-pressed={fit.enabled}
            title={fit.enabled ? '目前整頁縮小到一個畫面；再按一次回到原始大小' : '整頁縮小到一個畫面，不需要上下捲動'}
          >
            <Icon name="fit" />
            符合畫面
          </button>
        )}

        <button
          type="button"
          className="btn btn-icon theme-toggle"
          onClick={theme.cycle}
          aria-label={`切換主題（目前：${THEME_LABEL[theme.mode]}）`}
          title={`主題：${THEME_LABEL[theme.mode]}`}
        >
          <Icon name={theme.mode === 'light' ? 'sun' : theme.mode === 'dark' ? 'moon' : 'auto'} />
        </button>
      </div>
    </header>
  )
}
