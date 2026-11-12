import type { Scenario } from '../../types'
import { cloudAws } from './cloud-aws'

/**
 * 情境清單。第二階段要加「銀行自有機房 On-Premise」「家用主機 + Tailscale / Cloudflare Tunnel」，
 * 只要新增一個資料檔並放進這個陣列，畫面不用改。
 */
export const scenarios: Scenario[] = [cloudAws]

export const defaultScenario = cloudAws
