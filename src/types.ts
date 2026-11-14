/* ------------------------------------------------------------------ */
/*  Road Map（知識地圖）                                                 */
/* ------------------------------------------------------------------ */

/** 地圖上的四個區域：請求主路徑、側欄共通基礎、橫切關注、供應商與知識 */
export type Zone = 'path' | 'cross' | 'knowledge'

export interface InfoTable {
  caption?: string
  columns: string[]
  rows: string[][]
}

export interface Topic {
  id: string
  /** 命名規則：中文概念 English（括號內只放綁定的工具 / 平台） */
  title: string
  summary: string
  /** 宿主：這個東西跑在什麼上面、由誰承載 */
  host?: string
  tags?: string[]
  details?: string[]
  tables?: InfoTable[]
  /** 相關知識點 id */
  related?: string[]
  /** 延伸閱讀（公開網站） */
  links?: ExternalLink[]
  /** Port 之類的代碼，用等寬字顯示 */
  mono?: boolean
}

export interface ExternalLink {
  label: string
  url: string
}

export interface TopicSection {
  title?: string
  note?: string
  /** 依序串成一條路徑（用箭頭連接） */
  flow?: boolean
  topics: Topic[]
}

export interface Group {
  id: string
  zone: Zone
  title: string
  summary: string
  host?: string
  /** 屬於哪一個請求路徑分類（顯示在「共通基礎」欄），例如 Port、通訊協定屬於網路與流量入口 */
  parent?: string
  sections: TopicSection[]
}

/* ------------------------------------------------------------------ */
/*  Packet Journey（封包旅程）                                          */
/* ------------------------------------------------------------------ */

export type LayerId = 'l2' | 'l3' | 'l4' | 'tls' | 'l7'

/**
 * 每一站對每一層做了什麼：
 * h 讀取、s 封著不拆、e 加密看不到、o 在這裡拆開、r 在這裡改寫、n 不存在
 */
export type LayerState = 'h' | 's' | 'e' | 'o' | 'r' | 'n'
type S = LayerState
/** 五層狀態，依序為 L2、L3、L4、TLS、L7，例如 'hhhee' */
export type LayerCode = `${S}${S}${S}${S}${S}`

export type MachineKind =
  | 'laptop'
  | 'dns'
  | 'router'
  | 'internet'
  | 'edge'
  | 'firewall'
  | 'loadbalancer'
  | 'server'
  | 'database'

export interface Ownership {
  /** 實體機器屬於誰 */
  machine: string
  /** 軟體誰維護 */
  software: string
  /** 你要做什麼 */
  you: string
}

export interface JourneyNode {
  id: string
  kind: MachineKind
  label: string
  /** 宿主鏈，由下往上 */
  stack: string[]
  owner: Ownership
}

export type SegmentKind = 'tls' | 'plain' | 'dns' | 'db'

export interface Segment {
  id: string
  from: string
  to: string
  kind: SegmentKind
  /** 所屬的加密 / 明文區段 */
  tunnel?: string
  /** 線段自己的短標籤（DNS、資料庫連線） */
  label?: string
}

export interface Tunnel {
  id: string
  kind: SegmentKind
  label: string
  description: string
}

export interface Step {
  id: string
  node: string
  title: string
  description: string
  layers: LayerCode
  /** 覆寫層的名稱（例如 L7 不是 HTTP 而是 DNS / PostgreSQL） */
  layerNames?: Partial<Record<LayerId, string>>
  /** 這一站各層的範例內容，未提供就用情境預設值 */
  fields?: Partial<Record<LayerId, string>>
  /** 宿主鏈中目前所在的層（index，由下往上） */
  hostLayer: number | number[]
  /** 這一步封包正在走的線段 */
  segments?: string[]
  direction?: 'forward' | 'back'
  /** 對應 Road Map 的知識點 id */
  topics?: string[]
  /** 「典型設定，實際依環境而定」之類的提醒 */
  note?: string
}

export type Anchor = 'start' | 'middle' | 'end'
export type Side = 'above' | 'below' | 'left' | 'right'

export interface LabelPos {
  x: number
  y: number
  anchor?: Anchor
}

export interface NodePlacement {
  x: number
  y: number
  labelSide?: Side
  /** 需要微調時直接指定標籤位置（絕對座標） */
  label?: LabelPos
  packetSide?: Side
}

export interface ZoneBox {
  id: string
  label: string
  tone: 'home' | 'cloud' | 'subnet'
  x: number
  y: number
  w: number
  h: number
  labelPos: LabelPos
}

export interface Layout {
  width: number
  height: number
  labelSide: Side
  packetSide: Side
  nodes: Record<string, NodePlacement>
  zones: ZoneBox[]
  /** 線段轉折點 */
  via?: Record<string, { x: number; y: number }[]>
  segmentLabels?: Record<string, LabelPos>
  tunnelLabels: Record<string, LabelPos & { bracket?: { x1: number; x2: number; y: number } }>
}

export interface Scenario {
  id: string
  title: string
  subtitle: string
  disclaimer: string
  nodes: JourneyNode[]
  segments: Segment[]
  tunnels: Tunnel[]
  steps: Step[]
  defaultFields: Record<LayerId, string>
  layouts: { wide: Layout; narrow: Layout }
}
