/**
 * 整理中、之後會加進地圖的知識點（來源：筆記「新知識點」頁）。
 * 合併進 roadmap.ts 之後，從這裡刪掉對應的項目；全部合併完，這個區塊就不會顯示。
 */
export interface UpcomingTopic {
  title: string
  summary: string
}

export interface UpcomingArea {
  /** 合併後會放在地圖的哪一區 */
  area: string
  topics: UpcomingTopic[]
}

export const UPCOMING: UpcomingArea[] = [
  {
    area: '網路與流量入口',
    topics: [
      { title: '南北向 / 東西向流量', summary: '外部進出系統的流量，和系統內部服務之間的流量，入口與防護的做法不一樣。' },
      { title: '服務網格 Service Mesh', summary: '用 Sidecar 統一處理服務之間的 mTLS、重試、分流與指標，以及它什麼時候不值得用。' },
      { title: '邊緣運算 Edge Functions', summary: '程式直接跑在 CDN 節點上，在離使用者最近的機房先處理請求。' },
    ],
  },
  {
    area: '資料與訊息服務',
    topics: [
      { title: 'Outbox 模式與 CDC', summary: '寫資料庫和發訊息沒辦法放在同一個交易裡，要怎麼保持一致。' },
      { title: 'Saga 模式', summary: '跨好幾個服務的流程失敗時，用補償動作一步步退回。' },
      { title: 'CQRS', summary: '寫入和查詢用不同的資料模型，以及它和讀寫分離的差別。' },
      { title: '分散式鎖', summary: '多台機器搶同一件事時，怎麼確保只有一台在做，Redis 鎖又有哪些坑。' },
      { title: '分庫分表 Sharding', summary: '單一資料庫撐不住時，依分片鍵把資料拆開，以及要付出的代價。' },
    ],
  },
  {
    area: '交付與維運',
    topics: [
      { title: '分散式追蹤 Distributed Tracing', summary: '用同一個 Trace ID 串起請求經過的每個服務，找出最慢的那一段。' },
    ],
  },
]

export const upcomingCount = UPCOMING.reduce((n, a) => n + a.topics.length, 0)
