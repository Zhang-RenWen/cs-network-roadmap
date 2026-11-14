import type { Scenario } from '../../types'
import { cloudAws } from './cloud-aws'
import { loginOidc } from './login-oidc'

/**
 * 情境清單：新增情境只要加一個資料檔並放進這個陣列，畫面不用改。
 * 之後可以加「銀行自有機房 On-Premise」「家用主機 + Tailscale / Cloudflare Tunnel」。
 */
export const scenarios: Scenario[] = [cloudAws, loginOidc]

export const defaultScenario = cloudAws

export const getScenario = (id: string | undefined) => scenarios.find((s) => s.id === id) ?? defaultScenario

/** 預設情境的網址不帶情境 id（維持 #/journey/7 這種舊網址） */
export const scenarioParam = (scenario: Scenario) => (scenario.id === defaultScenario.id ? undefined : scenario.id)
