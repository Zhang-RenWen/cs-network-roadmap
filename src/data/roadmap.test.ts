import { describe, expect, it } from 'vitest'
import { allTopicEntries, getTopic, searchTopics } from '../lib/roadmapIndex'
import { groups } from './roadmap'

/** 個人筆記「計算機、網路世界 Road Map」的每一個子頁面，以及它在地圖上對應的知識點或分類 id */
const NOTE_SUBPAGES: [name: string, id: string][] = [
  ['Web Front-End', 'web-frontend'],
  ['iOS', 'ios'],
  ['macOS', 'macos'],
  ['瀏覽器', 'browser'],
  ['DNS / CDN', 'dns-cdn'],
  ['WAF', 'waf'],
  ['WAN / LAN', 'wan-lan'],
  ['防火牆規則', 'firewall'],
  ['Load Balancer', 'load-balancer'],
  ['API Gateway', 'api-gateway'],
  ['流量入口各節點：誰的主機、誰維護', 'ingress-owners'],
  ['旁路：NAT Gateway、VPN、跳板機', 'sidepath'],
  ['網路埠 Port', 'ports'],
  ['通訊協定 Protocols', 'protocols'],
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
  ['程式語言', 'languages'],
  ['Java', 'java'],
  ['Python', 'python'],
  ['C++', 'cpp'],
  ['Node.js', 'nodejs'],
  ['Ruby on Rails', 'rails'],
  ['資料庫', 'database'],
  ['快取', 'cache'],
  ['物件儲存', 'object-storage'],
  ['訊息佇列', 'mq'],
  ['發布訂閱', 'pubsub'],
  ['資安', 'security'],
  ['CI/CD', 'cicd'],
  ['IaC', 'iac'],
  ['可觀測性', 'observability'],
  ['排程', 'scheduler'],
  ['AWS', 'aws'],
  ['Cloudflare', 'cloudflare'],
  ['計算機基礎', 'cs-fundamentals'],
  ['LeetCode', 'leetcode'],
  ['系統設計與架構', 'system-design'],
  ['Code Review', 'code-review'],
  ['Git', 'git'],
  ['Scrum', 'scrum'],
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
  // 執行環境
  '實體機', 'Hypervisor', 'Compute', 'VPS', 'EC2', 'Docker Engine', 'Kubernetes', 'Serverless', 'Lambda', 'Workers',
  'Linux', 'Ubuntu', 'Debian', 'RHEL', 'Rocky', 'Alpine', 'Windows Server', 'Mainframe', 'AS400', 'z/OS', 'IBM i', 'COBOL',
  'Web Server', 'Nginx', 'Apache', 'IIS', 'Caddy', 'S3 + CloudFront', '靜態檔', 'TLS 終止',
  'Application Server', 'Tomcat', 'WebLogic', 'WebSphere', 'JBoss', 'Gunicorn', 'Puma', 'Spring Boot',
  'Node.js', 'mod_php', 'ASP.NET',
  // 應用程式
  'Java', 'JVM', 'Python', 'CPython', 'C++', '機器碼', 'Ruby on Rails', 'Rust', 'JS',
  // 資料與訊息服務
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'S3', 'MinIO', 'R2', 'RabbitMQ', 'SQS', 'Kafka', 'SNS', 'EventBridge',
  'Redis Pub/Sub', 'RDS', 'ElastiCache', 'RDBMS', 'NoSQL', '物件儲存', '訊息佇列', '發布訂閱',
  // 旁路
  'NAT Gateway', 'VPN', 'Bastion', 'Cloudflare Tunnel', 'Tailscale',
  // Port
  '80 / 443', '22', '3306', '5432', '6379', '27017', '9092', '1883',
  // 通訊協定
  'IP', 'ICMP', 'TCP', 'UDP', 'QUIC', 'TLS', 'HTTP/1.1', 'HTTP/2', 'HTTP/3', 'HTTPS', 'REST', 'GraphQL', 'gRPC', 'SOAP',
  'Polling', 'SSE', 'WebSocket', 'WebRTC', 'MQTT', 'CoAP', 'AMQP', 'STOMP', 'DHCP', 'NTP', 'SSH', 'RDP', 'SFTP', 'FTP',
  'SMB', 'SMTP', 'IMAP', 'POP3', 'OAuth 2.0', 'OIDC', 'SAML', 'LDAP',
  // 宿主鏈
  'Hypervisor / VM', '作業系統', '容器引擎', '語言 runtime', '你的程式', '雲端平台直接承載',
  // 資安
  'AuthN', 'MFA', 'Keycloak', 'IAM', 'RBAC', '最小權限', 'Secrets', 'Vault', 'Secrets Manager',
  // 交付與維運
  'CI/CD', 'GitHub Actions', 'Jenkins', 'Azure DevOps', 'Artifact', 'Rollback', 'IaC', 'Terraform', 'CloudFormation',
  'Ansible', 'Observability', 'Logs', 'Metrics', 'Traces', 'Prometheus', 'Grafana', 'ELK', 'Loki', 'CloudWatch',
  'Scheduler', 'cron', 'systemd timer', '工作排程器', 'CronJob', 'EventBridge Scheduler',
  // 供應商與知識
  'AWS', 'GCP', 'Azure', 'Cloudflare', '計算機基礎', 'LeetCode', '系統設計與架構',
  'Git', 'GitHub', 'GitLab', 'Code Review', 'Scrum',
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

  it('四個區域都有分類，且主路徑由外而內依序排列', () => {
    expect(groups.filter((g) => g.zone === 'path').map((g) => g.id)).toEqual(['client', 'network', 'runtime', 'app', 'data'])
    for (const zone of ['side', 'cross', 'knowledge'] as const) {
      expect(groups.some((g) => g.zone === zone), zone).toBe(true)
    }
  })
})

describe('涵蓋筆記 Road Map 的所有知識點', () => {
  const ids = new Set([...groups.map((g) => g.id), ...allTopicEntries.map((e) => e.topic.id)])

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
