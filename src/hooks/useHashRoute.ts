import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * Hash 路由（GitHub Pages 不需要額外設定）：
 *   #/map            世界地圖
 *   #/map/<topicId>  世界地圖 + 打開某個知識點
 *   #/journey/<n>    封包旅程第 n 站（1-based）
 */
export type Route = { view: 'map'; topicId?: string } | { view: 'journey'; step?: string }

export type Navigate = (to: Route, options?: { replace?: boolean }) => void

export function parseHash(hash: string): Route {
  const [view, param] = hash.replace(/^#\/?/, '').split('/')
  const value = param ? decodeURIComponent(param) : undefined
  if (view === 'journey') return { view: 'journey', step: value }
  if (view === 'map') return { view: 'map', topicId: value }
  return { view: 'map' }
}

export function routeToHash(route: Route): string {
  const param = route.view === 'journey' ? route.step : route.topicId
  return `#/${route.view}${param ? `/${encodeURIComponent(param)}` : ''}`
}

const LOCAL_EVENT = 'nwm:navigate'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener(LOCAL_EVENT, onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener(LOCAL_EVENT, onChange)
  }
}

const getHash = () => window.location.hash

export function useHashRoute(): [Route, Navigate] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  const route = useMemo(() => parseHash(hash), [hash])

  const navigate = useCallback<Navigate>((to, options) => {
    const next = routeToHash(to)
    if (next === window.location.hash) return
    if (options?.replace) {
      window.history.replaceState(window.history.state, '', next)
      window.dispatchEvent(new Event(LOCAL_EVENT))
    } else {
      window.location.hash = next
    }
  }, [])

  return [route, navigate]
}
