import type { IconName } from '../components/Icon'
import type { LayerCode, LayerId, LayerState } from '../types'

/** 由外而內 */
export const LAYER_ORDER: LayerId[] = ['l2', 'l3', 'l4', 'tls', 'l7']

export const LAYER_META: Record<LayerId, { tag: string; name: string; hint: string }> = {
  l2: { tag: 'L2', name: '訊框 Frame', hint: 'MAC 位址' },
  l3: { tag: 'L3', name: 'IP 標頭', hint: '來源 / 目的 IP' },
  l4: { tag: 'L4', name: 'TCP / UDP 標頭', hint: 'Port' },
  tls: { tag: 'TLS', name: 'TLS 加密層', hint: '加密與憑證' },
  l7: { tag: 'L7', name: 'HTTP 內容', hint: '路徑、Header、Body' },
}

export const STATE_META: Record<LayerState, { label: string; icon: IconName }> = {
  h: { label: '讀取', icon: 'eye' },
  s: { label: '封著，不拆', icon: 'seal' },
  e: { label: '加密，看不到', icon: 'lock' },
  o: { label: '在這裡拆開', icon: 'open' },
  r: { label: '在這裡改寫', icon: 'pencil' },
  n: { label: '不存在', icon: 'dash' },
}

export function parseLayerCode(code: LayerCode): Record<LayerId, LayerState> {
  return Object.fromEntries(LAYER_ORDER.map((id, i) => [id, code[i] as LayerState])) as Record<LayerId, LayerState>
}
