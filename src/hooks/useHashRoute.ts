import { useCallback, useMemo, useSyncExternalStore } from 'react'

/**
 * Hash 路由（GitHub Pages 不需要額外設定）：
 *   #/map                      世界地圖
 *   #/map/<topicId>            世界地圖 + 打開某個知識點
 *   #/journey/<n>              預設情境的封包旅程第 n 站（1-based）
 *   #/journey/<scenarioId>/<n> 其他情境的第 n 站
 */
export type Route = { view: 'map'; topicId?: string } | { view: 'journey'; scenario?: string; step?: string }

export type Navigate = (to: Route, options?: { replace?: boolean }) => void

const isStepNumber = (value: string) => /^\d+$/.test(value)

export function parseHash(hash: string): Route {
  const [view, ...params] = hash.replace(/^#\/?/, '').split('/')
  const [first, second] = params.filter(Boolean).map(decodeURIComponent)
  if (view === 'journey') {
    if (first === undefined) return { view: 'journey' }
    if (second !== undefined) return { view: 'journey', scenario: first, step: second }
    return isStepNumber(first) ? { view: 'journey', step: first } : { view: 'journey', scenario: first }
  }
  if (view === 'map') return { view: 'map', topicId: first }
  return { view: 'map' }
}

export function routeToHash(route: Route): string {
  const params = route.view === 'journey' ? [route.scenario, route.step] : [route.topicId]
  return `#/${route.view}${params
    .filter((p): p is string => Boolean(p))
    .map((p) => `/${encodeURIComponent(p)}`)
    .join('')}`
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
