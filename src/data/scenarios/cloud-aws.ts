import type { Scenario } from '../../types'

const LAPTOP_STACK = [
  '實體機（筆電、Wi-Fi 網卡）',
  '作業系統核心 macOS：TCP/IP 協定堆疊',
  '瀏覽器 Chrome：TLS、HTTP',
  'JS 引擎 V8',
  '前端程式 React',
]

const SERVER_STACK = [
  'AWS 實體機',
  'Hypervisor：每個 Fargate Task 一個隔離的 microVM',
  '作業系統核心 Linux：TCP/IP 協定堆疊',
  '容器執行環境：網路命名空間（awsvpc）',
  '語言 runtime：JVM',
  'Application Server：Spring Boot 內建 Tomcat',
  '你的程式：Controller → Service → Repository',
]

/**
 * 情境 A：雲端（典型的 AWS 上雲路徑）
 * 瀏覽器 → 家用路由器 → ISP → Cloudflare → Security Group → ALB → ECS Fargate → RDS
 */
export const cloudAws: Scenario = {
  id: 'cloud-aws',
  title: '情境 A：雲端（AWS 上雲）',
  subtitle: 'Cloudflare → ALB → ECS Fargate（Spring Boot）→ RDS PostgreSQL',
  disclaimer: 'Cloudflare 用 Full (strict)、ALB → 容器走明文是典型設定，實際依環境而定。',

  nodes: [
    {
      id: 'laptop',
      kind: 'laptop',
      label: '你的電腦',
      stack: LAPTOP_STACK,
      owner: { machine: '你自己', software: 'Apple（macOS）、Google（Chrome）', you: '寫前端程式、發出請求' },
    },
    {
      id: 'dns',
      kind: 'dns',
      label: 'DNS 解析器',
      stack: ['機房實體機（ISP / Cloudflare）', 'DNS 伺服器軟體', '你在後台填的 DNS 紀錄'],
      owner: {
        machine: '查詢端：ISP、Google 8.8.8.8、Cloudflare 1.1.1.1；網域紀錄：Cloudflare',
        software: '業者',
        you: '在後台填 DNS 紀錄',
      },
    },
    {
      id: 'router',
      kind: 'router',
      label: '家用路由器',
      stack: ['路由器硬體', '廠商韌體', 'NAT 表'],
      owner: { machine: '你自己（或電信業者租給你）', software: '廠商韌體', you: '設定 Wi-Fi、Port 轉發' },
    },
    {
      id: 'internet',
      kind: 'internet',
      label: 'ISP / 網際網路',
      stack: ['電信業者機房 / 海底電纜', '核心路由器', '路由表（BGP）'],
      owner: { machine: '電信業者、海底電纜業者', software: '他們', you: '不用做' },
    },
    {
      id: 'edge',
      kind: 'edge',
      label: 'Cloudflare 邊緣',
      stack: ['Cloudflare 全球邊緣機房', '邊緣伺服器', 'CDN / WAF 軟體與你的規則'],
      owner: { machine: 'Cloudflare 全球邊緣節點', software: 'Cloudflare', you: '設定 SSL 模式、快取、WAF 規則' },
    },
    {
      id: 'sg',
      kind: 'firewall',
      label: '防火牆 SG',
      stack: ['AWS 實體網路設備', '虛擬化層 Hypervisor', 'Security Group 規則'],
      owner: { machine: 'AWS', software: 'AWS（在虛擬化層執行）', you: '填 Inbound / Outbound 規則' },
    },
    {
      id: 'lb',
      kind: 'loadbalancer',
      label: 'ALB',
      stack: ['AWS 機房', 'ALB 代管服務', 'Listener 與路由規則'],
      owner: { machine: 'AWS', software: 'AWS', you: '設定 Listener、Target Group、憑證' },
    },
    {
      id: 'server',
      kind: 'server',
      label: 'Fargate 容器',
      stack: SERVER_STACK,
      owner: {
        machine: 'AWS（Fargate 連機器都由 AWS 管）',
        software: 'AWS 管到容器執行環境；映像檔裡的東西是你的',
        you: '提供容器映像檔、設定 Task 與環境變數',
      },
    },
    {
      id: 'db',
      kind: 'database',
      label: 'RDS PostgreSQL',
      stack: ['AWS 實體機', 'RDS 代管服務', 'PostgreSQL 引擎', '你的 Schema 與資料'],
      owner: { machine: 'AWS', software: 'AWS 代管（修補、備份）', you: '設計 Schema、管帳號權限、決定開不開 TLS' },
    },
  ],

  segments: [
    { id: 'laptop-dns', from: 'laptop', to: 'dns', kind: 'dns', label: 'UDP 53' },
    { id: 'laptop-router', from: 'laptop', to: 'router', kind: 'tls', tunnel: 'tls1' },
    { id: 'router-internet', from: 'router', to: 'internet', kind: 'tls', tunnel: 'tls1' },
    { id: 'internet-edge', from: 'internet', to: 'edge', kind: 'tls', tunnel: 'tls1' },
    { id: 'edge-sg', from: 'edge', to: 'sg', kind: 'tls', tunnel: 'tls2' },
    { id: 'sg-lb', from: 'sg', to: 'lb', kind: 'tls', tunnel: 'tls2' },
    { id: 'lb-server', from: 'lb', to: 'server', kind: 'plain', tunnel: 'plain' },
    { id: 'server-db', from: 'server', to: 'db', kind: 'db', label: '5432' },
  ],

  tunnels: [
    { id: 'tls1', kind: 'tls', label: 'TLS ① 加密', description: '瀏覽器 ↔ Cloudflare：瀏覽器的鎖頭只代表這一段' },
    { id: 'tls2', kind: 'tls', label: 'TLS ②', description: 'Cloudflare ↔ ALB：Full (strict) 模式重新加密' },
    { id: 'plain', kind: 'plain', label: 'HTTP 明文（典型）', description: 'ALB → 容器：VPC 內網常以明文傳送' },
  ],

  defaultFields: {
    l2: 'Wi-Fi 訊框：你的網卡 MAC → 路由器 MAC',
    l3: '192.168.1.23 → 104.21.x.x（Cloudflare 邊緣）',
    l4: 'TCP :52814 → :443',
    tls: 'TLS 1.3 · AES-GCM 密文',
    l7: 'GET /api/orders/summary HTTP/1.1\nHost: app.example.com\nAuthorization: Bearer eyJhbGciOi…',
  },

  steps: [
    {
      id: 'browser-request',
      node: 'laptop',
      title: '瀏覽器產生 HTTP 請求',
      description:
        "前端 React 呼叫 fetch('https://app.example.com/api/…')，瀏覽器組出 HTTP 請求：方法、路徑、Header、Body。這時還只是應用層的一段文字，還沒有任何網路標頭。",
      layers: 'nnnnh',
      hostLayer: 4,
      topics: ['web-frontend', 'browser', 'http11', 'rest', 'session-jwt'],
    },
    {
      id: 'dns-lookup',
      node: 'dns',
      title: 'DNS 查詢：網域 → IP',
      description:
        '瀏覽器與作業系統的快取裡沒有，才去問 DNS 解析器（這裡是 ISP 的解析器，走 UDP 53）這個網域的 IP。因為開了 Cloudflare 代理，拿到的是 Cloudflare 邊緣節點的 IP，不是你的伺服器。這種查詢不加密；如果你設定的解析器支援 DoH（例如 1.1.1.1、8.8.8.8），Chrome 會自動改用加密的 DoH（走 443）。查詢其實也會經過路由器與 ISP，這裡畫成一條虛線簡化。',
      layers: 'hhhnh',
      layerNames: { l4: 'UDP 標頭', l7: 'DNS 查詢' },
      fields: {
        l2: 'MAC：上一跳路由器 → DNS 伺服器',
        l3: '203.0.113.7（你家對外 IP）→ 198.51.100.53（ISP 的 DNS 解析器）',
        l4: 'UDP :53124 → :53',
        l7: 'A? app.example.com\n← 104.21.x.x（Cloudflare 邊緣，不是你的伺服器）',
      },
      hostLayer: 1,
      segments: ['laptop-dns'],
      topics: ['dns-cdn', 'dns', 'udp', 'cloudflare', 'ts-dns'],
    },
    {
      id: 'handshake',
      node: 'laptop',
      title: '建立連線：TCP 握手 + TLS 握手',
      description:
        '作業系統核心先做 TCP 三向交握（SYN → SYN-ACK → ACK），瀏覽器再做 TLS 握手：驗證 Cloudflare 的憑證、協商出這條連線的金鑰，並用 ALPN 順便談好用 HTTP/2。握手時的 SNI 會帶出網域名稱，所以路上的人看得到你要連哪個網域。',
      layers: 'hhhhn',
      fields: {
        l4: 'SYN → SYN-ACK → ACK（三向交握）\nTCP :52814 → :443',
        tls: 'ClientHello · SNI: app.example.com\nALPN: h2（說好用 HTTP/2）\n← 憑證（確認對方是 Cloudflare）+ 金鑰協商',
      },
      hostLayer: [1, 2],
      segments: ['laptop-router', 'router-internet', 'internet-edge'],
      topics: ['tcp', 'tls-handshake', 'tls', 'https', 'ts-tls'],
      note: '瀏覽器 ↔ Cloudflare 這段實際上多半是 HTTP/2（甚至 HTTP/3），是二進位格式；本頁為了好讀，HTTP 一律畫成 HTTP/1.1 的文字。Cloudflare 回源、ALB 轉給容器則預設就是 HTTP/1.1。',
    },
    {
      id: 'encapsulate',
      node: 'laptop',
      title: '封裝：一層一層裝進信封',
      description:
        'HTTP 被 TLS 加密 → 加上 TCP 標頭（目的 Port 443）→ 加上 IP 標頭（來源內網 IP、目的 Cloudflare 邊緣 IP）→ 包成 Wi-Fi 訊框（MAC 位址），從網卡送出。從這裡開始，路上的人只看得到外面三層。',
      layers: 'hhhee',
      hostLayer: [0, 1],
      topics: ['ip', 'tcp', 'tls'],
    },
    {
      id: 'router-nat',
      node: 'router',
      title: '家用路由器：NAT 改寫來源位址',
      description:
        '路由器只拆到 IP / Port：把來源 192.168.1.23:52814 換成你家的對外 IP 203.0.113.7:61002，記進 NAT 表（回應回來時才知道要還給誰），再換一個新的訊框送往 ISP。它看不到 HTTP 內容。',
      layers: 'rrree',
      fields: {
        l2: '新訊框：路由器 MAC → ISP 設備 MAC',
        l3: '來源改寫：192.168.1.23 → 203.0.113.7\n目的：104.21.x.x',
        l4: '來源 Port 改寫：52814 → 61002\n目的 :443',
      },
      hostLayer: 2,
      segments: ['laptop-router'],
      topics: ['router-nat', 'wan-lan'],
    },
    {
      id: 'isp',
      node: 'internet',
      title: 'ISP 與網際網路骨幹',
      description:
        '封包經過好幾台路由器，每一跳只看目的 IP 決定下一站、換一個新的訊框。看得到雙方 IP、SNI 網域、流量大小與時間；看不到網址路徑、Header 與內容。',
      layers: 'rhsee',
      fields: {
        l2: '每一跳換新的訊框（MAC 只在同一段網路有效）',
        l3: '203.0.113.7 → 104.21.x.x（只看目的 IP 決定下一跳；每一跳 TTL 減 1）',
        l4: 'TCP :61002 → :443（路由器不看）',
      },
      hostLayer: 1,
      segments: ['router-internet'],
      topics: ['isp', 'ip', 'icmp'],
    },
    {
      id: 'edge',
      node: 'edge',
      title: 'Cloudflare 邊緣：第一次 TLS 終止',
      description:
        '在這裡解密 TLS ①，看得到完整 HTTP：WAF 檢查攻擊、DDoS 防護、能快取的直接回應。要往後送時，開一條新連線、重新加密成 TLS ②（SSL 模式 Full (strict)）。',
      layers: 'ooooo',
      fields: {
        l2: 'MAC：ISP 設備 → 邊緣伺服器',
        l3: '203.0.113.7 → 104.21.x.x',
        l4: 'TCP :61002 → :443',
        tls: 'TLS ① 在這裡解密（Cloudflare 的憑證）',
        l7: 'GET /api/orders/summary HTTP/1.1\nHost: app.example.com\n→ WAF 規則檢查、快取判斷',
      },
      hostLayer: 2,
      segments: ['internet-edge'],
      topics: ['dns-cdn', 'http-caching', 'waf', 'ddos', 'tls-termination', 'cloudflare'],
      note: '典型設定：若 SSL 模式是 Flexible，Cloudflare 往後這段會變成 HTTP 明文。有些架構在 Cloudflare 與 ALB 之間還會多一層 CloudFront + 全域 WAF，這裡省略，概念相同：再一次 TLS 終止。',
    },
    {
      id: 'security-group',
      node: 'sg',
      title: '進入 VPC：Security Group 檢查',
      description:
        '封包進入 AWS 的虛擬網路。注意來源 IP 已經變成 Cloudflare，不是你家：這是 Cloudflare 新開的連線（你的真實 IP 放在 CF-Connecting-IP / X-Forwarded-For Header 裡）。Security Group 在虛擬化層比對 Inbound 規則：只開 443、只允許 Cloudflare 的 IP 範圍。只看 IP / Port，不碰內容。',
      layers: 'hhhee',
      fields: {
        l2: 'VPC 虛擬網路的訊框',
        l3: '172.68.x.x（Cloudflare）→ ALB 的 IP',
        l4: 'TCP :41532 → :443 ✓ 符合 Inbound 規則',
        tls: 'TLS ②（Cloudflare 重新加密的新連線）',
      },
      hostLayer: 2,
      segments: ['edge-sg'],
      topics: ['vpc', 'firewall', 'security-layers', 'ts-timeout'],
    },
    {
      id: 'alb',
      node: 'lb',
      title: 'ALB：第二次 TLS 終止 + 依路徑分流',
      description:
        'ALB 解密 TLS ②，看得懂 HTTP：依路徑 /api/* 轉給 Spring Boot 的 Target Group，並持續做健康檢查。在 VPC 內常以 HTTP 明文轉給容器。',
      layers: 'ooooo',
      fields: {
        l2: 'VPC 虛擬網路的訊框',
        l3: '172.68.x.x → 10.0.1.25（ALB，Public Subnet）',
        l4: 'TCP :41532 → :443',
        tls: 'TLS ② 在這裡解密（ACM 憑證）',
        l7: 'GET /api/orders/summary HTTP/1.1\nX-Forwarded-For: 203.0.113.7, 172.68.x.x\n（Cloudflare 帶來你的 IP，ALB 再補上它看到的 Cloudflare IP）\n→ 規則 /api/* → Target Group（Spring Boot）',
      },
      hostLayer: 2,
      segments: ['sg-lb'],
      topics: ['load-balancer', 'reverse-proxy', 'tls-termination', 'aws', 'ts-502'],
      note: 'ALB → 容器走 HTTP 明文是雲端常見的典型設定，實際依環境而定；金融業資安規範常要求內網也加密（TLS re-encryption 或 mTLS）。',
    },
    {
      id: 'kernel',
      node: 'server',
      title: '進入主機：網卡 → 作業系統核心（解封裝）',
      description:
        '網卡收到訊框，作業系統核心一層層拆：拆掉訊框 → 讀 IP → 讀 TCP、重組資料，再依目的 Port 交給正在聽 8080 的行程。核心不解析 HTTP，只把位元組交上去。',
      layers: 'ooons',
      fields: {
        l2: '網卡（ENI）收到訊框',
        l3: '10.0.1.25（ALB）→ 10.0.2.40（Task，Private Subnet）',
        l4: 'TCP :38210 → :8080 → 交給聽 8080 的行程',
        l7: 'GET /api/orders/summary HTTP/1.1 …（明文位元組，核心不解析）',
      },
      hostLayer: 2,
      segments: ['lb-server'],
      topics: ['host-os', 'linux', 'tcp'],
    },
    {
      id: 'container',
      node: 'server',
      title: '容器：轉進容器的網路命名空間',
      description:
        'Fargate 用 awsvpc 網路模式：每個 Task 有自己的網卡與私有 IP，容器直接在 8080 聽。自架 Docker 時則由 Port 對應（-p 80:8080）把主機的 Port 轉進容器的網路命名空間。對程式來說，就像直接在一台機器上聽 8080。',
      layers: 'nnnns',
      fields: { l7: 'HTTP 位元組串流 → 容器內聽 :8080 的 java 行程' },
      hostLayer: 3,
      topics: ['container', 'host-container', 'ts-refused'],
    },
    {
      id: 'tomcat',
      node: 'server',
      title: 'Application Server：Tomcat 解析 HTTP',
      description:
        'Spring Boot 內建的 Tomcat 讀出方法、路徑、Header、Body，從執行緒池分一條執行緒；Spring Security 的 Filter 先驗證 Keycloak 簽發的 JWT，再交給對應的 Controller。',
      layers: 'nnnno',
      fields: {
        l7: 'GET /api/orders/summary\nAuthorization: Bearer eyJ…（驗證 Keycloak 簽的 JWT）\n→ 執行緒池 → DispatcherServlet → Controller',
      },
      hostLayer: 5,
      topics: ['tomcat', 'embedded-as', 'authn', 'oidc', 'session-jwt', 'ts-auth'],
    },
    {
      id: 'business',
      node: 'server',
      title: '應用程式：在 JVM 上跑業務邏輯',
      description:
        'Controller → Service → Repository：權限檢查（RBAC）、計算、開啟資料庫交易。你寫的 Java 程式碼在這一層執行，底下由 Tomcat 與 JVM 承載。',
      layers: 'nnnnh',
      fields: {
        l7: '@GetMapping("/api/orders/summary")\n→ OrderService：RBAC 檢查、計算\n→ Repository：開啟交易、查資料庫',
      },
      hostLayer: 6,
      topics: ['java', 'host-code', 'iam', 'ts-500'],
    },
    {
      id: 'database',
      node: 'db',
      title: '資料庫：另一條連線、另一個協定',
      description:
        '程式透過連線池，用 PostgreSQL 自己的 TCP 協定（Port 5432）連到 Private Subnet 裡的 RDS，送 SQL、拿結果、交易 commit。RDS 也有自己的 Security Group：只允許 App 的 Security Group 連 5432。',
      layers: 'ooooo',
      layerNames: { l7: 'PostgreSQL 協定（SQL）' },
      fields: {
        l2: 'VPC 虛擬網路的訊框',
        l3: '10.0.2.40（Task）→ 10.0.3.15（RDS，Private Subnet）',
        l4: 'TCP :45678 → :5432',
        tls: 'RDS for PostgreSQL 15 起預設強制 TLS（rds.force_ssl=1）',
        l7: 'SELECT … FROM orders WHERE …\nCOMMIT',
      },
      hostLayer: 2,
      segments: ['server-db'],
      topics: ['database', 'port-postgres', 'aws', 'ts-504'],
      note: 'RDS for PostgreSQL 15 起預設強制 TLS；驅動預設的 sslmode=prefer 會加密但不驗證憑證，要確認連到的是真的 RDS，用 sslmode=verify-full 並裝上 RDS 的 CA。舊版本或關掉 rds.force_ssl 時，這段可能是明文。',
    },
    {
      id: 'response',
      node: 'laptop',
      title: '回程：原路返回，逐段重新加密',
      description:
        '回應沿原路回去：程式 → Tomcat → 核心封裝 → ALB 用 TLS ② 加密 → Cloudflare 解密再用 TLS ① 加密 → 路由器依 NAT 表換回內網位址 → 瀏覽器解密，React 拿到 JSON 畫出畫面。',
      layers: 'ooooo',
      fields: {
        l2: 'Wi-Fi 訊框：路由器 MAC → 你的網卡 MAC',
        l3: '104.21.x.x → 192.168.1.23（路由器依 NAT 表換回）',
        l4: 'TCP :443 → :52814',
        tls: 'TLS ① 在瀏覽器解密',
        l7: 'HTTP/1.1 200 OK\nContent-Type: application/json\n{ "summary": … }',
      },
      hostLayer: 4,
      segments: ['server-db', 'lb-server', 'sg-lb', 'edge-sg', 'internet-edge', 'router-internet', 'laptop-router'],
      direction: 'back',
      topics: ['tls-termination', 'router-nat', 'web-frontend', 'http-caching'],
    },
  ],

  layouts: {
    wide: {
      width: 860,
      height: 370,
      labelSide: 'below',
      packetSide: 'above',
      nodes: {
        laptop: { x: 56, y: 196 },
        dns: { x: 156, y: 56, labelSide: 'right', packetSide: 'left' },
        router: { x: 156, y: 196 },
        internet: { x: 262, y: 196 },
        edge: { x: 364, y: 196 },
        sg: { x: 460, y: 196 },
        lb: { x: 558, y: 196 },
        server: { x: 692, y: 196 },
        db: { x: 804, y: 296, packetSide: 'left' },
      },
      zones: [
        { id: 'home', label: '你家（LAN）', tone: 'home', x: 10, y: 136, w: 198, h: 122, labelPos: { x: 20, y: 154 } },
        { id: 'vpc', label: 'AWS VPC（私有網路）', tone: 'cloud', x: 460, y: 22, w: 392, h: 340, labelPos: { x: 842, y: 42, anchor: 'end' } },
        { id: 'public', label: 'Public Subnet', tone: 'subnet', x: 504, y: 126, w: 108, h: 150, labelPos: { x: 512, y: 143 } },
        { id: 'private', label: 'Private Subnet', tone: 'subnet', x: 624, y: 126, w: 218, h: 226, labelPos: { x: 834, y: 143, anchor: 'end' } },
      ],
      via: { 'server-db': [{ x: 804, y: 196 }] },
      segmentLabels: {
        'laptop-dns': { x: 124, y: 92, anchor: 'end' },
        'server-db': { x: 814, y: 248, anchor: 'start' },
      },
      tunnelLabels: {
        tls1: { x: 210, y: 96, bracket: { x1: 56, x2: 364, y: 104 } },
        tls2: { x: 461, y: 96, bracket: { x1: 364, x2: 558, y: 104 } },
        plain: { x: 625, y: 96, bracket: { x1: 558, x2: 692, y: 104 } },
      },
    },
    narrow: {
      width: 360,
      height: 790,
      labelSide: 'right',
      packetSide: 'left',
      nodes: {
        laptop: { x: 84, y: 76, label: { x: 126, y: 94 } },
        dns: { x: 276, y: 44, labelSide: 'below', packetSide: 'left' },
        router: { x: 84, y: 186 },
        internet: { x: 84, y: 296 },
        edge: { x: 84, y: 400 },
        sg: { x: 84, y: 470, label: { x: 116, y: 458 } },
        lb: { x: 84, y: 564 },
        server: { x: 84, y: 704, labelSide: 'below' },
        db: { x: 276, y: 704, labelSide: 'below', packetSide: 'above' },
      },
      zones: [
        { id: 'home', label: '你家（LAN）', tone: 'home', x: 10, y: 28, w: 196, h: 200, labelPos: { x: 196, y: 220, anchor: 'end' } },
        { id: 'vpc', label: 'AWS VPC（私有網路）', tone: 'cloud', x: 10, y: 470, w: 340, h: 312, labelPos: { x: 340, y: 490, anchor: 'end' } },
        { id: 'public', label: 'Public Subnet', tone: 'subnet', x: 24, y: 516, w: 312, h: 96, labelPos: { x: 326, y: 534, anchor: 'end' } },
        { id: 'private', label: 'Private Subnet', tone: 'subnet', x: 24, y: 640, w: 312, h: 136, labelPos: { x: 326, y: 658, anchor: 'end' } },
      ],
      segmentLabels: {
        'laptop-dns': { x: 186, y: 46, anchor: 'middle' },
        'server-db': { x: 180, y: 694, anchor: 'middle' },
      },
      tunnelLabels: {
        tls1: { x: 100, y: 245, anchor: 'start' },
        tls2: { x: 100, y: 506, anchor: 'start' },
        plain: { x: 100, y: 631, anchor: 'start' },
      },
    },
  },
}
