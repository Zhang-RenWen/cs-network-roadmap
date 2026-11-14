import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { allTopicEntries } from './lib/roadmapIndex'
import { defaultScenario, scenarios } from './data/scenarios'

const total = defaultScenario.steps.length

function renderAt(hash: string) {
  window.history.replaceState(null, '', `/${hash}`)
  return render(<App />)
}

const counter = () => screen.getByTestId('step-counter').textContent

describe('封包旅程', () => {
  it('預設顯示第一步，← 在第一步不動，→ 前進', () => {
    renderAt('#/journey')
    expect(counter()).toBe(`1 / ${total}`)
    expect(screen.getByRole('button', { name: '上一步' })).toBeDisabled()

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(counter()).toBe(`1 / ${total}`)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(counter()).toBe(`2 / ${total}`)
    expect(window.location.hash).toBe('#/journey/2')
  })

  it('最後一步「下一步」停用，→ 不會超出', () => {
    renderAt('#/journey')
    fireEvent.keyDown(window, { key: 'End' })
    expect(counter()).toBe(`${total} / ${total}`)
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(counter()).toBe(`${total} / ${total}`)
  })

  it('從網址直接打開某一步，按鈕可以前後移動', () => {
    renderAt('#/journey/7')
    expect(counter()).toBe(`7 / ${total}`)
    expect(screen.getByRole('heading', { level: 2, name: defaultScenario.steps[6].title })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(counter()).toBe(`8 / ${total}`)
    fireEvent.click(screen.getByRole('button', { name: '上一步' }))
    expect(counter()).toBe(`7 / ${total}`)
  })

  it('點插圖上的機器跳到那一站', () => {
    renderAt('#/journey')
    fireEvent.click(screen.getByRole('button', { name: '防火牆 SG：跳到這一站' }))
    const sgStep = defaultScenario.steps.findIndex((s) => s.node === 'sg')
    expect(counter()).toBe(`${sgStep + 1} / ${total}`)
  })

  it('加密的層會顯示「加密，看不到」', () => {
    const routerStep = defaultScenario.steps.findIndex((s) => s.id === 'router-nat') + 1
    renderAt(`#/journey/${routerStep}`) // 家用路由器：rrree
    const layers = screen.getByRole('region', { name: /封包現在長這樣/ })
    expect(within(layers).getAllByText('在這裡改寫').length).toBeGreaterThanOrEqual(3)
    expect(within(layers).getByText('內容被加密，這一站看不到')).toBeInTheDocument()
  })

  it('自動播放會前進，最後一步停下', () => {
    vi.useFakeTimers()
    try {
      renderAt(`#/journey/${total - 1}`)
      fireEvent.click(screen.getByRole('button', { name: '自動播放' }))
      act(() => vi.advanceTimersByTime(4000))
      expect(counter()).toBe(`${total} / ${total}`)
      act(() => vi.advanceTimersByTime(4000))
      expect(screen.getByRole('button', { name: '自動播放' })).toHaveAttribute('aria-pressed', 'false')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('符合畫面', () => {
  it('預設開啟；頁首按鈕可以關掉，偏好記在瀏覽器', () => {
    renderAt('#/journey')
    const toggle = screen.getByRole('button', { name: '符合畫面' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(window.localStorage.getItem('nwm-journey-fit')).toBe('off')
  })

  it('世界地圖不顯示這個按鈕', () => {
    renderAt('#/map')
    expect(screen.queryByRole('button', { name: '符合畫面' })).not.toBeInTheDocument()
  })

  it('寬螢幕：改成三欄，每一站的面板疊成同一格撐出固定高度，隱藏副本碰不到也不重複 id', () => {
    const original = window.matchMedia
    window.matchMedia = (query: string) => ({ ...original(query), matches: query.includes('min-width') })
    try {
      const { container } = renderAt('#/journey/5')
      expect(container.querySelector('.journey')).toHaveClass('is-fit')
      expect(container.querySelector('.journey-col .jmap')).toBeInTheDocument()
      expect(container.querySelector('.step-stack--step-host .step-panel')).toBeInTheDocument()

      // 中間（說明 + 宿主鏈）與右邊（封包信封）兩格，每一站各一份副本
      const ghosts = container.querySelectorAll('.step-ghost')
      expect(ghosts).toHaveLength(total * 2)
      for (const ghost of ghosts) {
        expect(ghost).toHaveAttribute('aria-hidden', 'true')
        expect(ghost).toHaveAttribute('inert')
      }

      // 輔助技術只看得到目前這一站
      expect(screen.getByRole('heading', { level: 2, name: defaultScenario.steps[4].title })).toBeInTheDocument()
      expect(screen.getAllByRole('region', { name: /封包現在長這樣/ })).toHaveLength(1)

      const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
      expect(new Set(ids).size).toBe(ids.length)
    } finally {
      window.matchMedia = original
    }
  })
})

describe('情境切換與「這一站壞掉會怎樣」', () => {
  const login = scenarios.find((s) => s.id === 'login-oidc')!

  it('#/journey/<情境>/<n> 打開其他情境，前後移動時網址保留情境', () => {
    renderAt('#/journey/login-oidc')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(login.title)
    expect(counter()).toBe(`1 / ${login.steps.length}`)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(window.location.hash).toBe('#/journey/login-oidc/2')
    expect(screen.getByRole('heading', { level: 2, name: login.steps[1].title })).toBeInTheDocument()
  })

  it('情境切換列標出目前的情境，預設情境的網址不帶情境 id', () => {
    renderAt('#/journey/3')
    const tabs = screen.getByRole('navigation', { name: '情境' })
    const links = within(tabs).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#/journey', '#/journey/login-oidc'])
    expect(links[0]).toHaveAttribute('aria-current', 'page')
  })

  it('每一站顯示壞掉時會看到的症狀，並連到故障地圖', () => {
    const dnsStep = defaultScenario.steps.findIndex((s) => s.id === 'dns-lookup') + 1
    renderAt(`#/journey/${dnsStep}`)
    const panel = screen.getByRole('region', { name: defaultScenario.steps[dnsStep - 1].title })
    const card = within(panel).getByText('這一站壞掉會怎樣').closest('.step-fail') as HTMLElement
    expect(card).not.toBeNull()
    expect(within(card).getByText('ERR_NAME_NOT_RESOLVED')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /ERR_NAME_NOT_RESOLVED →/ })).toHaveAttribute('href', '#/map/ts-dns')
  })

  it('知識點抽屜裡的步驟連結會打開對的情境', async () => {
    renderAt('#/map/pkce')
    const dialog = await screen.findByRole('dialog')
    const authorize = login.steps.findIndex((s) => s.id === 'authorize')
    fireEvent.click(within(dialog).getByRole('button', { name: new RegExp(login.steps[authorize].title) }))
    expect(window.location.hash).toBe(`#/journey/login-oidc/${authorize + 1}`)
  })
})

describe('世界地圖', () => {
  it('列出所有知識點', () => {
    renderAt('#/map')
    const chips = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-haspopup') === 'dialog')
    expect(chips.length).toBe(allTopicEntries.length)
  })

  it('點知識點打開說明，Esc 關閉', async () => {
    renderAt('#/map')
    fireEvent.click(screen.getByRole('button', { name: /TLS 終止：HTTPS 整條線都加密嗎/ }))
    const dialog = await screen.findByRole('dialog')
    expect(window.location.hash).toBe('#/map/tls-termination')
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent('TLS 終止')
    expect(within(dialog).getByText(/在封包旅程中/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('從網址直接打開知識點', () => {
    renderAt('#/map/port-postgres')
    expect(screen.getByRole('dialog')).toHaveTextContent('5432')
  })

  it('搜尋會標出符合的知識點', () => {
    renderAt('#/map')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Keycloak' } })
    expect(screen.getByText(/找到 \d+ 個知識點/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /身分驗證 AuthN/ })).toHaveClass('is-hit')
    expect(screen.getByRole('button', { name: /^Caddy$/ })).toHaveClass('is-dim')
  })
})
