import { describe, expect, it } from 'vitest'
import { parseHash, routeToHash } from './useHashRoute'

describe('hash 路由', () => {
  it('解析各種網址', () => {
    expect(parseHash('')).toEqual({ view: 'map' })
    expect(parseHash('#/')).toEqual({ view: 'map' })
    expect(parseHash('#/map')).toEqual({ view: 'map', topicId: undefined })
    expect(parseHash('#/map/tls-termination')).toEqual({ view: 'map', topicId: 'tls-termination' })
    expect(parseHash('#/journey')).toEqual({ view: 'journey', step: undefined })
    expect(parseHash('#/journey/7')).toEqual({ view: 'journey', step: '7' })
    expect(parseHash('#/journey/login-oidc')).toEqual({ view: 'journey', scenario: 'login-oidc' })
    expect(parseHash('#/journey/login-oidc/3')).toEqual({ view: 'journey', scenario: 'login-oidc', step: '3' })
    expect(parseHash('#/unknown/xyz')).toEqual({ view: 'map' })
  })

  it('來回轉換一致', () => {
    for (const hash of ['#/map', '#/map/port-http', '#/journey', '#/journey/15', '#/journey/login-oidc', '#/journey/login-oidc/3']) {
      expect(routeToHash(parseHash(hash))).toBe(hash)
    }
  })
})
