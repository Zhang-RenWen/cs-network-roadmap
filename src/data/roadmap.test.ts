import { describe, expect, it } from 'vitest'
import { allTopicEntries, getTopic, searchTopics } from '../lib/roadmapIndex'
import type { Zone } from '../types'
import { groups } from './roadmap'

/**
 * 個人筆記「計算機科學、網路世界 Road Map」的 12 個分類頁，以及它在地圖上對應的分類 id 與區域。
 * 筆記分成三區：請求路徑（由外而內）、橫切關注、供應商與知識。
 */
const NOTE_CATEGORIES: [name: string, id: string, zone: Zone][] = [
  ['用戶端 Client', 'client', 'path'],
  ['網路與流量入口', 'network', 'path'],
  ['執行環境', 'runtime', 'path'],
  ['應用程式', 'app', 'path'],
  ['資料與訊息服務', 'data', 'path'],
  ['資安', 'security', 'cross'],
  ['交付與維運', 'delivery', 'cross'],
  ['故障地圖', 'troubleshooting', 'cross'],
  ['雲端供應商筆記', 'cloud', 'knowledge'],
  ['CS 理論與架構設計', 'cs', 'knowledge'],
  ['開發流程與協作', 'workflow', 'knowledge'],
  ['開發環境與工具', 'devenv', 'knowledge'],
]

/** 各分類頁底下的子頁（與頁內的主題），以及它在地圖上對應的知識點或分類 id */
const NOTE_SUBPAGES: [name: string, id: string][] = [
  // 用戶端
  ['瀏覽器原理', 'browser'],
  // 網路與流量入口
  ['無線網路效能：Wi-Fi 與行動網路', 'wireless'],
  ['DNS / CDN', 'dns-cdn'],
  ['加密連線握手 TLS / HTTPS Handshake', 'tls-handshake'],
  ['HTTP 快取', 'http-caching'],
  ['WAF', 'waf'],
  ['DDoS 防護', 'ddos'],
  ['VPC / Subnet', 'vpc'],
  ['WAN / LAN', 'wan-lan'],
  ['防火牆規則', 'firewall'],
  ['Load Balancer', 'load-balancer'],
  ['反向代理 / Ingress', 'reverse-proxy'],
  ['API Gateway', 'api-gateway'],
  ['流量入口各節點：誰的主機、誰維護', 'ingress-owners'],
  ['旁路：NAT Gateway、VPN、跳板機', 'nat-gateway'],
  ['網路埠 Port', 'ports'],
  ['通訊協定與連線方式 Protocols', 'protocols'],
  ['傳輸效能：延遲、TCP、UDP 與 TLS 最佳化', 'transport-perf'],
  ['HTTP 協定演進', 'http-evolution'],
  // 執行環境
  ['主機 Compute', 'compute'],
  ['容器', 'container'],
  ['Serverless', 'serverless'],
  ['Linux', 'linux'],
  ['Windows Server', 'windows-server'],
  ['Mainframe／AS400', 'mainframe'],
  ['Web Server 與 Application Server（概念）', 'web-app-server'],
  ['IIS', 'iis'],
  ['Nginx', 'nginx'],
  ['Apache', 'apache'],
  ['S3 + CloudFront', 's3-cloudfront'],
  // 應用程式
  ['主機 vs 宿主', 'host-vs-machine'],
  ['選語言的判斷框架', 'languages'],
  ['跨語言對照', 'cross-lang'],
  ['Java', 'java'],
  ['Python', 'python'],
  ['Go', 'go'],
  ['C++', 'cpp'],
  ['Rust', 'rust'],
  ['Node.js', 'nodejs'],
  ['Ruby on Rails', 'rails'],
  // 資料與訊息服務
  ['資料庫', 'database'],
  ['快取', 'cache'],
  ['物件儲存', 'object-storage'],
  ['訊息佇列', 'mq'],
  ['發布訂閱', 'pubsub'],
  ['資料工程', 'data-engineering'],
  // 資安
  ['同源政策與 CORS、前端資安', 'browser-security'],
  ['登入狀態 Cookie / Session vs JWT', 'session-jwt'],
  // 交付與維運
  ['CI/CD', 'cicd'],
  ['IaC', 'iac'],
  ['可觀測性', 'observability'],
  ['排程', 'scheduler'],
  // 故障地圖
  ['症狀對照表', 'ts-overview'],
  // 雲端供應商筆記
  ['雲端架構（AWS）', 'aws'],
  ['Cloudflare', 'cloudflare'],
  ['AWS 成本', 'aws-cost'],
  // CS 理論與架構設計
  ['取捨 Trade-offs', 'tradeoffs'],
  ['效能與規模', 'perf-scale'],
  ['計算機基礎', 'cs-fundamentals'],
  ['LeetCode', 'leetcode'],
  ['系統設計與架構', 'system-design'],
  ['資料結構與演算法', 'dsa'],
  ['設計原則與設計模式', 'design-patterns'],
  // 開發流程與協作
  ['Git', 'git'],
  ['Code Review', 'code-review'],
  ['測試', 'testing'],
  ['Scrum', 'scrum'],
  // 開發環境與工具
  ['本機環境速查', 'local-env'],
  ['工具與平台筆記', 'tools'],
  ['常用連結', 'links'],
]

/** Road Map 圖上與筆記頁面列出的每一個知識點 */
const KNOWLEDGE_POINTS = [
  // 用戶端
  'Web Front-End', '瀏覽器', 'Chrome', 'V8', 'iOS', 'macOS', 'App',
  // 網路與流量入口
  'NAT', 'ISP', '網際網路', 'DNS', 'CDN', 'WAF', 'DDoS', 'VPC', 'Public Subnet', 'Private Subnet', 'WAN', 'LAN',
  'Inbound', 'Outbound', 'Security Group', 'iptables', 'Load Balancer', 'L4 / L7', 'ALB', 'HAProxy', 'F5',
  '反向代理', 'Ingress', 'API Gateway', 'Kong', 'Spring Cloud Gateway',
  'Wi-Fi', '行動網路', 'TLS 1.3', 'ClientHello', 'SNI', 'HTTP 快取', 'Cache-Control', 'ETag', '304',
  // 執行環境
  '實體機', 'Hypervisor', 'Compute', 'VPS', 'EC2', 'Docker Engine', 'Kubernetes', 'Serverless', 'Lambda', 'Workers',
  'Linux', 'Ubuntu', 'Debian', 'RHEL', 'Rocky', 'Alpine', 'Windows Server', 'Mainframe', 'AS400', 'z/OS', 'IBM i', 'COBOL',
  'Web Server', 'Nginx', 'Apache', 'IIS', 'Caddy', 'S3 + CloudFront', '靜態檔', 'TLS 終止',
  'Application Server', 'Tomcat', 'WebLogic', 'WebSphere', 'JBoss', 'Gunicorn', 'Puma', 'Spring Boot',
  'Node.js', 'mod_php', 'ASP.NET',
  // 應用程式
  'Java', 'JVM', 'Python', 'CPython', 'C++', '機器碼', 'Ruby on Rails', 'Rust', 'JS', 'Go', 'goroutine',
  '選語言的判斷框架', '跨語言對照', 'TypeScript', '主機 vs 宿主', 'SPA 沒有宿主',
  // 資料與訊息服務
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'S3', 'MinIO', 'R2', 'RabbitMQ', 'SQS', 'Kafka', 'SNS', 'EventBridge',
  'Redis Pub/Sub', 'RDS', 'ElastiCache', 'RDBMS', 'NoSQL', '物件儲存', '訊息佇列', '發布訂閱',
  '資料工程', 'ETL', 'OLAP', '資料倉儲',
  // 旁路
  'NAT Gateway', 'VPN', 'Bastion', 'Cloudflare Tunnel', 'Tailscale',
  // Port
  '80 / 443', '22', '3306', '5432', '6379', '27017', '9092', '1883',
  // 通訊協定
  'IP', 'ICMP', 'TCP', 'UDP', 'QUIC', 'TLS', 'HTTP/1.1', 'HTTP/2', 'HTTP/3', 'HTTPS', 'REST', 'GraphQL', 'gRPC', 'SOAP',
  'Polling', 'SSE', 'WebSocket', 'WebRTC', 'MQTT', 'CoAP', 'AMQP', 'STOMP', 'DHCP', 'NTP', 'SSH', 'RDP', 'SFTP', 'FTP',
  'SMB', 'SMTP', 'IMAP', 'POP3', 'OAuth 2.0', 'OIDC', 'SAML', 'LDAP',
  '傳輸效能', '緩步啟動', 'HTTP 協定演進', '多路複用',
  // 宿主鏈
  'Hypervisor / VM', '作業系統', '容器引擎', '語言 runtime', '你的程式', '雲端平台直接承載',
  // 資安
  'AuthN', 'MFA', 'Keycloak', 'IAM', 'RBAC', '最小權限', 'Secrets', 'Vault', 'Secrets Manager',
  '同源政策', 'CORS', 'CSP', 'XSS', 'CSRF', 'Cookie', 'Session', 'JWT', 'HttpOnly', 'SameSite',
  // 故障地圖
  '故障地圖', 'ERR_NAME_NOT_RESOLVED', 'Connection refused', 'Timeout', '401 / 403', '502 Bad Gateway',
  '503 Service Unavailable', '504 Gateway Timeout', '500', '白畫面', '只有部分使用者',
  // 交付與維運
  'CI/CD', 'GitHub Actions', 'Jenkins', 'Azure DevOps', 'Artifact', 'Rollback', 'IaC', 'Terraform', 'CloudFormation',
  'Ansible', 'Observability', 'Logs', 'Metrics', 'Traces', 'Prometheus', 'Grafana', 'ELK', 'Loki', 'CloudWatch',
  'Scheduler', 'cron', 'systemd timer', '工作排程器', 'CronJob', 'EventBridge Scheduler',
  // 供應商與知識
  'AWS', 'GCP', 'Azure', 'Cloudflare', 'AWS 成本', 'FinOps',
  '取捨', '效能與規模', '計算機基礎', 'LeetCode', '系統設計與架構', '資料結構與演算法', 'SOLID', 'GoF',
  'Git', 'GitHub', 'GitLab', 'Code Review', '測試', '單元測試', '整合測試', 'E2E', 'Scrum',
  '本機環境', 'NVM', 'Homebrew', 'VS Code', 'Bruno', 'pnpm', 'ngrok', 'Dev Tunnels', '常用連結',
]

/** 畫面上看得到的文字：分類卡片 + 知識點標題、摘要、宿主、標籤 */
const visibleText = groups
  .flatMap((g) => [
    g.title,
    g.summary,
    g.host ?? '',
    ...g.sections.flatMap((s) => [
      s.title ?? '',
      s.note ?? '',
      ...s.topics.flatMap((t) => [t.title, t.summary, t.host ?? '', ...(t.tags ?? [])]),
    ]),
  ])
  .join('\n')

describe('Road Map 資料', () => {
  it('知識點 id 全部不重複', () => {
    const ids = allTopicEntries.map((e) => e.topic.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('分類 id 不重複，每個分類都有知識點', () => {
    expect(new Set(groups.map((g) => g.id)).size).toBe(groups.length)
    for (const g of groups) {
      expect(g.sections.flatMap((s) => s.topics).length, g.id).toBeGreaterThan(0)
    }
  })

  it('每個知識點都有標題與摘要', () => {
    for (const { topic } of allTopicEntries) {
      expect(topic.title.trim(), topic.id).not.toBe('')
      expect(topic.summary.trim(), topic.id).not.toBe('')
    }
  })

  it('相關知識點的連結都指向存在的知識點', () => {
    for (const { topic } of allTopicEntries) {
      for (const id of topic.related ?? []) expect(getTopic(id), `${topic.id} → ${id}`).toBeDefined()
    }
  })

  it('三個區域都有分類，且主路徑由外而內依序排列', () => {
    expect(groups.filter((g) => g.zone === 'path' && !g.parent).map((g) => g.id)).toEqual([
      'client',
      'network',
      'runtime',
      'app',
      'data',
    ])
    for (const zone of ['cross', 'knowledge'] as const) {
      expect(groups.some((g) => g.zone === zone), zone).toBe(true)
    }
  })

  it('共通基礎的卡片都掛在某個請求路徑分類底下', () => {
    const top = new Set(groups.filter((g) => g.zone === 'path' && !g.parent).map((g) => g.id))
    const basics = groups.filter((g) => g.parent)
    expect(basics.map((g) => g.id)).toEqual(['ports', 'protocols', 'hostchain'])
    for (const g of basics) {
      expect(top, g.id).toContain(g.parent)
      expect(g.zone, g.id).toBe('path')
    }
  })

  it('延伸閱讀只連到公開的 https 網站', () => {
    for (const { topic } of allTopicEntries) {
      for (const link of topic.links ?? []) {
        expect(link.url, topic.id).toMatch(/^https:\/\//)
        expect(link.url, topic.id).not.toMatch(/notion/)
      }
    }
  })
})

describe('涵蓋筆記 Road Map 的所有知識點', () => {
  const ids = new Set([...groups.map((g) => g.id), ...allTopicEntries.map((e) => e.topic.id)])

  it.each(NOTE_CATEGORIES)('筆記分類「%s」有對應的分類（%s，%s 區）', (name, id, zone) => {
    const group = groups.find((g) => g.id === id)
    expect(group).toBeDefined()
    expect(group!.zone).toBe(zone)
    expect(group!.parent).toBeUndefined()
    expect(group!.title).toContain(name.split(' ')[0])
  })

  it.each(NOTE_SUBPAGES)('筆記子頁面「%s」有對應的知識點（%s）', (_name, id) => {
    expect(ids).toContain(id)
  })

  it.each(KNOWLEDGE_POINTS)('「%s」出現在地圖上', (keyword) => {
    expect(visibleText).toContain(keyword)
  })
})

describe('搜尋', () => {
  it('空字串不篩選', () => {
    expect(searchTopics('   ')).toBeNull()
  })

  it('不分大小寫、可以用多個關鍵字縮小範圍', () => {
    expect(searchTopics('keycloak')).toContain('authn')
    expect(searchTopics('5432')).toContain('port-postgres')
    const both = searchTopics('tls 終止')!
    expect(both).toContain('tls-termination')
    expect(both.size).toBeLessThan(searchTopics('tls')!.size)
  })

  it('也會找表格與補充說明裡的內容', () => {
    expect(searchTopics('F5')).toContain('ingress-owners')
  })
})
