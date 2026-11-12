import type { Group } from '../types'

/**
 * 計算機、網路世界 Road Map
 * 主軸：一個請求從使用者走到資料的路徑，由外而內排列；
 * 之後是每層都會碰到的「橫切關注」，最後是不屬於架構的知識與工具。
 * 命名規則：中文概念 English（括號內只放綁定的工具 / 平台）。
 */
export const ROADMAP_TITLE = '計算機、網路世界 Road Map'
export const ROADMAP_SUBTITLE = '一個請求由外而內穿過每一層'

export const groups: Group[] = [
  /* ================================================================ */
  /*  請求路徑（由外而內）                                              */
  /* ================================================================ */
  {
    id: 'client',
    zone: 'path',
    title: '用戶端 Client',
    summary:
      '請求的起點：使用者的瀏覽器或裝置對網域發出請求，經過網路與流量入口，才到後端的 Application Server。',
    host: 'Web 前端 → 瀏覽器（JS 引擎，如 Chrome V8）；iOS / macOS 本身是用戶端作業系統，宿主是 Apple 裝置。',
    sections: [
      {
        topics: [
          {
            id: 'web-frontend',
            title: 'Web 前端 Web Front-End',
            summary:
              '用 HTML、CSS、JavaScript（Vue、React）寫成、在瀏覽器裡執行的介面；打包後的靜態檔通常交給 Web Server 或 CDN 送出。',
            host: '瀏覽器的 JS 引擎（Chrome V8）',
            tags: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Vite'],
            details: [
              '前後端分離時，前端只是一包靜態檔；真正的資料要靠 fetch / XHR 呼叫後端 API。',
              '瀏覽器的鎖頭只代表「瀏覽器 → 第一個 TLS 終止點」這一段有加密。',
            ],
            related: ['browser', 's3-cloudfront', 'https'],
          },
          {
            id: 'browser',
            title: '瀏覽器 Browser（Chrome V8）',
            summary:
              '執行前端程式、組出 HTTP 請求、處理 DNS 查詢、TLS 握手與 Cookie 的用戶端軟體；內建 JS 引擎（Chrome 是 V8）。',
            host: '用戶端作業系統（macOS、Windows、iOS、Android）',
            tags: ['Chrome', 'V8', 'Safari', 'DevTools', 'fetch'],
            details: [
              'Polling、SSE、WebSocket、WebRTC 都是瀏覽器內建能力。',
              'DevTools 的 Network 分頁可以看到每個請求的時間軸：DNS、連線、TLS、等待回應。',
            ],
            related: ['web-frontend', 'tls', 'websocket'],
          },
          {
            id: 'ios',
            title: 'iOS',
            summary: 'Apple 行動裝置的作業系統；App 直接呼叫後端 API，不經過瀏覽器，但一樣要走 DNS、TLS、HTTP。',
            host: 'Apple 裝置（iPhone、iPad）',
            tags: ['Swift', 'SwiftUI', 'URLSession', 'App'],
          },
          {
            id: 'macos',
            title: 'macOS',
            summary: 'Apple 電腦的作業系統，也是很多開發者的本機環境；有完整的 TCP/IP 協定堆疊，內建 ssh、curl、dig。',
            host: 'Mac 實體機',
            tags: ['Darwin（Unix）', 'Terminal', 'ssh', 'curl'],
            related: ['local-env'],
          },
        ],
      },
    ],
  },

  {
    id: 'network',
    zone: 'path',
    title: '網路與流量入口',
    summary:
      '流量進到你的伺服器之前的那段路：網域解析、邊緣快取與防護、防火牆、分流、API 入口；以及整條路上共用的 Port 與通訊協定。',
    host: 'DNS / CDN / WAF → 多由邊緣供應商代管（Cloudflare、AWS）；防火牆規則 → 作業系統（iptables、Windows 防火牆）或雲端虛擬網路（Security Group）；Load Balancer、API Gateway → 主機上的軟體（Nginx、HAProxy、Kong、Spring Cloud Gateway）或雲端代管（ALB、AWS API Gateway）。',
    sections: [
      {
        title: '用戶端網路出口',
        flow: true,
        topics: [
          {
            id: 'router-nat',
            title: '路由器 NAT',
            summary:
              '家用 / 公司路由器把內網 IP（192.168.x.x）和 Port 換成一個對外 IP 再送出，記在 NAT 表裡，回應回來時再換回去。',
            host: '路由器硬體 + 廠商韌體（你自己的，或電信業者租給你）',
            tags: ['NAT 表', 'Port 轉發', 'CGNAT', 'Wi-Fi'],
            details: [
              '只拆到 IP / Port（L3 / L4），看不到 HTTP 內容。',
              '外面的連線預設進不來，要設定 Port 轉發；很多家用網路在電信業者的 CGNAT 後面，連真正的對外 IP 都沒有。',
            ],
            related: ['wan-lan', 'nat-gateway', 'cf-tunnel'],
          },
          {
            id: 'isp',
            title: '電信業者 ISP / 網際網路 Internet',
            summary:
              '封包經過電信業者與網際網路骨幹上的好幾台路由器，每一跳只看目的 IP 決定下一站、換一個新的訊框。',
            host: '電信業者機房（中華電信等）、各國電信與海底電纜業者',
            tags: ['骨幹路由器', '路由表', 'BGP', 'traceroute', 'mtr'],
            details: [
              '只轉送、不解密。看得到：雙方 IP、TLS 握手時的 SNI 網域、流量大小與時間。',
              '看不到：網址路徑、Header、內容、密碼。',
            ],
            related: ['ip', 'tls'],
          },
        ],
      },
      {
        title: '傳輸路徑',
        note: '路由器 / ISP → DNS → CDN / WAF / DDoS 防護 → VPC 邊界（WAN / LAN）→ 防火牆規則 → Load Balancer → 反向代理 / Ingress → API Gateway → 執行環境',
        flow: true,
        topics: [
          {
            id: 'dns-cdn',
            title: '網域解析與內容傳遞 DNS / CDN',
            summary:
              'DNS 把網域換成 IP，決定使用者被導到哪裡；CDN 在全球邊緣節點快取靜態內容，讓回應離使用者更近。',
            host: '業者代管。查詢端：ISP、Google（8.8.8.8）、Cloudflare（1.1.1.1）；網域紀錄：Cloudflare、Route 53',
            tags: ['A / AAAA / CNAME', 'TTL', 'dig', 'Cloudflare', 'CloudFront', 'Route 53'],
            details: [
              'DNS 查詢通常走 UDP 53、不加密（DoH / DoT 可以加密）。',
              '開了 Cloudflare 代理（橘色雲朵）後，DNS 回的是 Cloudflare 邊緣節點的 IP，不是你的伺服器。',
              '你要做的事：在後台填 DNS 紀錄、設定快取規則。',
            ],
            related: ['dns', 'cloudflare', 'udp'],
          },
          {
            id: 'waf',
            title: 'Web 應用防火牆 WAF',
            summary:
              '看得懂 HTTP 內容（L7）的防火牆：擋 SQL Injection、XSS、惡意 Bot、異常流量；必須先 TLS 終止，才看得到內容。',
            host: '邊緣供應商代管（Cloudflare WAF；AWS WAF 掛在 CloudFront / ALB 上）',
            tags: ['OWASP Top 10', 'Rate Limiting', 'Bot 管理', '自訂規則'],
            related: ['tls-termination', 'firewall', 'security-layers'],
          },
          {
            id: 'ddos',
            title: 'DDoS 防護',
            summary: '在邊緣吸收大量惡意流量，不讓它打到你的伺服器；通常和 CDN / WAF 一起提供。',
            host: '邊緣供應商（Cloudflare、AWS Shield）',
            tags: ['Cloudflare', 'AWS Shield', 'Anycast'],
            related: ['waf', 'dns-cdn'],
          },
          {
            id: 'vpc',
            title: '雲端虛擬網路 VPC / 子網路 Subnet',
            summary:
              '進入你自己的網路範圍：Public Subnet 放對外入口（Load Balancer），Private Subnet 放 App 與資料庫。',
            host: 'AWS 實體網路設備，虛擬化出來的；你負責劃網段、決定 Public / Private',
            tags: ['CIDR', 'Public Subnet', 'Private Subnet', 'Route Table', 'Internet Gateway'],
            related: ['wan-lan', 'nat-gateway', 'aws'],
          },
          {
            id: 'wan-lan',
            title: '廣域 / 區域網路 WAN / LAN',
            summary:
              'LAN 是家裡、公司或機房內部的網路（私有 IP），WAN 是連到外面的廣域網路；路由器站在兩者交界。',
            host: '路由器、交換器（家裡是你的；機房是公司的；雲端是虛擬化的）',
            tags: ['私有 IP 10 / 172.16 / 192.168', '交換器 Switch', '對外 IP'],
            related: ['router-nat', 'vpc'],
          },
          {
            id: 'firewall',
            title: '防火牆規則 Inbound / Outbound',
            summary:
              '依 IP、Port、協定決定放行或拒絕（L3 / L4），不看 HTTP 內容；Inbound 管誰能連進來，Outbound 管能連出去哪裡。',
            host: '作業系統（iptables、Windows 防火牆）或雲端虛擬網路（Security Group）；金融業機房常見硬體防火牆',
            tags: ['Security Group', 'iptables', 'Windows 防火牆', '硬體防火牆', 'Inbound', 'Outbound'],
            details: [
              'Security Group 由 AWS 在虛擬化層執行，你只填規則；iptables 跑在你那台虛擬機的作業系統裡，規則自己寫。',
              '原則：Public interface 越少越好，對外只開 80 / 443。',
            ],
            related: ['waf', 'ports-overview'],
          },
          {
            id: 'load-balancer',
            title: '負載平衡 Load Balancer',
            summary:
              '把流量分給多台後端並做健康檢查；L4 只看 IP / Port，L7 看得懂 HTTP，可依路徑分流、做 TLS 終止。',
            host: '雲端代管（ALB、NLB）或主機上的軟體（HAProxy、Nginx）；機房常見 F5',
            tags: ['L4 / L7', 'ALB', 'NLB', 'HAProxy', 'F5', 'Health Check'],
            related: ['reverse-proxy', 'tls-termination'],
          },
          {
            id: 'reverse-proxy',
            title: '反向代理 Reverse Proxy / Ingress',
            summary:
              '依網域、路徑把請求轉給對的服務；常由 Nginx 或 K8s Ingress 扮演，實務上常和 Load Balancer 合併（如 AWS ALB 依路徑分流）。',
            host: '你自己：Nginx / K8s Ingress 裝在租來的機器上（或由 ALB 代管扮演）',
            tags: ['Nginx', 'K8s Ingress', 'ALB 路徑規則'],
            related: ['nginx', 'load-balancer', 'container'],
          },
          {
            id: 'api-gateway',
            title: 'API 入口 API Gateway',
            summary: '所有 API 的統一入口：驗證 Token、限流、路由、版本管理、記錄。',
            host: '雲端代管（AWS API Gateway）或自己部署（Kong、Spring Cloud Gateway）',
            tags: ['AWS API Gateway', 'Kong', 'Spring Cloud Gateway'],
            related: ['authn', 'reverse-proxy'],
          },
        ],
      },
      {
        title: '延伸筆記',
        topics: [
          {
            id: 'ingress-owners',
            title: '流量入口各節點：誰的主機、誰維護',
            summary:
              '系統架在雲端時，幾乎每個節點都跑在別人的主機上，真正屬於你的只有家裡的路由器。差別不在「機器是誰的」，而在「軟體誰維護」。',
            tables: [
              {
                columns: ['節點', '實體機器屬於誰', '軟體誰維護', '你做什麼'],
                rows: [
                  ['路由器（NAT）', '你自己（或電信業者租給你）', '廠商韌體', '設定 Wi-Fi、Port 轉發'],
                  ['ISP', '電信業者', '電信業者', '不用做'],
                  ['網際網路骨幹', '各國電信、海底電纜業者', '他們', '不用做'],
                  ['DNS', '查詢端：ISP、Google、Cloudflare；網域紀錄：Cloudflare、Route 53', '業者', '在後台填 DNS 紀錄'],
                  ['CDN / WAF / DDoS 防護', 'Cloudflare、AWS 全球邊緣節點', '業者', '設定快取、規則'],
                  ['VPC / Subnet', 'AWS 實體網路設備', 'AWS（虛擬化出來的）', '劃網段、決定 Public / Private'],
                  ['防火牆規則（Security Group）', 'AWS', 'AWS（在虛擬化層執行）', '填 Inbound / Outbound 規則'],
                  ['防火牆規則（iptables）', 'AWS 實體機', '你：跑在你那台虛擬機的作業系統裡', '自己寫規則'],
                  ['Load Balancer（ALB）', 'AWS', 'AWS', '設定 Listener、Target'],
                  ['Load Balancer（HAProxy）', '雲端實體機', '你：裝在租來的虛擬機上', '安裝、設定、更新、監控'],
                  ['反向代理 / Ingress', '雲端實體機', '你：Nginx 或 K8s Ingress', '安裝、設定、更新'],
                  ['API Gateway（AWS）', 'AWS', 'AWS', '設定路由'],
                  ['API Gateway（Kong、Spring Cloud Gateway）', '雲端實體機', '你', '自己部署、維護'],
                ],
              },
            ],
            details: [
              '完全別人的：ISP、網際網路骨幹，碰不到也不用管。',
              '代管服務：DNS、CDN、WAF、VPC、Security Group、ALB、AWS API Gateway，你只填設定。',
              '自架在租來的機器上：iptables、HAProxy、Nginx、Kong、Spring Cloud Gateway，軟體你裝、你顧、壞了你修。',
              '典型的雲端例子：Cloudflare（DNS + 代理）→ CloudFront + 全域 WAF → ALB + 區域 WAF → ECS Fargate，整條鏈都是代管服務。',
              '例外是公司自有機房（On-Premise）：從防火牆、Load Balancer 到伺服器都是公司自己的，常見硬體防火牆、F5；銀行核心系統（Mainframe / AS400）多半是這種環境。',
            ],
            related: ['host-physical', 'aws', 'cloudflare'],
          },
        ],
      },
    ],
  },

  {
    id: 'runtime',
    zone: 'path',
    title: '執行環境',
    summary: '程式實際跑在哪裡：機器 → 作業系統 → 伺服器軟體。',
    host: '實體機 / VM → 作業系統 → 容器引擎 → 伺服器軟體；雲端服務 → 供應商平台。',
    sections: [
      {
        title: '運算方式',
        note: '主機 → 實體機，或雲端的虛擬化層（Hypervisor）；容器 → 作業系統上的容器引擎（Docker Engine；K8s 管理多台主機）；Serverless → 雲端供應商的執行平台，你看不到底下的主機。',
        topics: [
          {
            id: 'compute',
            title: '主機 / 伺服器 Compute / Server',
            summary: '一台跑作業系統的機器：實體機，或雲端由 Hypervisor 切出來的虛擬機（VPS、EC2）。',
            host: '實體機；雲端是虛擬化層 Hypervisor',
            tags: ['實體機', 'Hypervisor', 'VM', 'VPS', 'EC2'],
            related: ['host-physical', 'host-hypervisor'],
          },
          {
            id: 'container',
            title: '容器 Container（Docker / Kubernetes）',
            summary:
              '把程式和相依套件打包成映像檔，共用主機的作業系統核心、用命名空間隔離；Kubernetes 負責在多台主機上排程與管理容器。',
            host: '作業系統上的容器引擎（Docker Engine）；ECS Fargate 連機器都由 AWS 管，你只提供映像檔',
            tags: ['Docker Engine', 'Image', 'Kubernetes', 'ECS', 'Fargate'],
            details: ['自架 Docker 時用 Port 對應（-p 80:8080）把主機的 Port 轉進容器的網路命名空間。'],
            related: ['host-container', 'reverse-proxy'],
          },
          {
            id: 'serverless',
            title: '無伺服器 Serverless',
            summary: '只上傳函式，平台在請求進來時才執行、依次數計費；看不到底下的主機與作業系統。',
            host: '雲端供應商的執行平台（AWS Lambda、Cloudflare Workers）',
            tags: ['AWS Lambda', 'Cloudflare Workers'],
            related: ['as-platform', 'host-serverless'],
          },
        ],
      },
      {
        title: '作業系統',
        note: '宿主：主機（實體機或虛擬機）；Mainframe / AS400 是硬體 + 作業系統（z/OS、IBM i）綁在一起的整套平台。',
        topics: [
          {
            id: 'linux',
            title: 'Linux',
            summary: '伺服器最常見的作業系統；核心負責 TCP/IP 協定堆疊、行程、記憶體與檔案系統。',
            host: '主機（實體機或虛擬機）',
            tags: ['Linux 核心', 'Ubuntu', 'Debian', 'RHEL', 'Rocky', 'Alpine'],
            details: ['連不上時的診斷：ss -tulpen、lsof -i :PORT、curl -v、dig、ping、mtr。'],
            related: ['host-os', 'scheduler'],
          },
          {
            id: 'windows-server',
            title: 'Windows Server',
            summary: '微軟的伺服器作業系統，搭配 IIS、ASP.NET、Active Directory，企業內部系統常見。',
            host: '主機（實體機或虛擬機）',
            tags: ['IIS', 'ASP.NET', 'Active Directory', 'RDP'],
            related: ['iis', 'rdp'],
          },
          {
            id: 'mainframe',
            title: 'Mainframe／AS400 + COBOL',
            summary:
              '銀行核心系統常見的大型主機：硬體 + 作業系統綁成整套平台（IBM Z 跑 z/OS；AS400 即 IBM i），程式多為 COBOL，著重交易量、穩定與相容。',
            host: '硬體 + 作業系統綁在一起的整套平台，多半放在公司自有機房',
            tags: ['z/OS', 'IBM i', 'COBOL', 'CICS', 'DB2', '批次作業'],
            related: ['ingress-owners', 'database'],
          },
        ],
      },
      {
        title: '伺服器軟體 Web Server / Application Server',
        note: 'Web Server 和 Application Server 都是角色，不是特定軟體：負責接收請求並回傳回應，可以由裝在作業系統上的軟體扮演，也可以由雲端代管服務扮演。',
        topics: [
          {
            id: 'web-app-server',
            title: 'Web Server 與 Application Server（概念）',
            summary:
              'Web Server 在前：接 HTTP、送靜態檔、反向代理、TLS 終止。Application Server 在後：把你寫的函式「跑起來」、接上網路請求、執行業務邏輯。',
            host: '軟體 → 作業系統或容器（Application Server 再往下是語言 runtime：JVM、V8、CPython）；雲端服務 → 供應商平台',
            tables: [
              {
                caption: '用 Java 寫 MVC，部署時會有兩個服務嗎？看兩個角色要不要拆開',
                columns: ['部署方式', '路徑', '適合'],
                rows: [
                  ['一個服務', '瀏覽器 → Spring Boot（內建 Tomcat，聽 8080）', '本機開發、內部小系統、Demo'],
                  ['兩個服務', '瀏覽器 → Nginx（443）→ Spring Boot（8080，只對內網）', '最常見的正式環境'],
                  ['傳統企業版', '瀏覽器 → Apache / IIS → Tomcat / WebLogic / WebSphere（.war）', '金融、保險、政府的老系統'],
                  ['雲端 / K8s', '瀏覽器 → ALB 或 Ingress → Spring Boot 容器', 'Web Server 的角色被平台取代'],
                ],
              },
            ],
            details: [
              '伺服器（Server）是一台機器；Web Server 是機器上處理 HTTP 的軟體；Application Server 是跑業務邏輯的程式環境。',
              '分工原因：Web Server 擅長同時應付大量連線和送檔案，Application Server 擅長跑業務邏輯；後端程式也不用直接暴露在外網。',
              '業界常把 IIS、Tomcat、WebLogic、MQ 統稱中介軟體 Middleware；本地圖依「在請求路徑的位置」分組，所以資料庫、MQ 放在程式後面。',
            ],
            related: ['nginx', 'tomcat', 'tls-termination'],
          },
        ],
      },
      {
        title: 'Web Server 角色',
        topics: [
          {
            id: 'nginx',
            title: 'Web Server（Nginx）',
            summary: '事件驅動的高效能 Web Server，常做反向代理、TLS 終止、送靜態檔；K8s Ingress 底層也常是它。',
            host: 'Linux 為主，也能跑在 Windows；或容器',
            tags: ['80 / 443', '反向代理', 'TLS 終止', '靜態檔'],
            related: ['reverse-proxy', 'tls-termination'],
          },
          {
            id: 'apache',
            title: 'Web Server（Apache）',
            summary: '歷史悠久的 Web Server（httpd），模組化；透過 mod_php 可以直接執行 PHP。',
            host: 'Linux 為主',
            tags: ['httpd', 'mod_php', '.htaccess'],
            related: ['as-in-webserver'],
          },
          {
            id: 'iis',
            title: 'Web Server（IIS）',
            summary: '微軟的 Web Server，只能跑在 Windows；可以直接承載 ASP.NET 程式。',
            host: 'Windows Server（本機開發可用 Windows 10 / 11）',
            tags: ['Windows Server', 'ASP.NET'],
            related: ['windows-server', 'as-in-webserver'],
          },
          {
            id: 'caddy',
            title: 'Caddy',
            summary: '會自動申請與更新 HTTPS 憑證（Let’s Encrypt）的 Web Server，設定精簡。',
            host: 'Linux / 容器',
            tags: ['自動 HTTPS', "Let's Encrypt"],
          },
          {
            id: 's3-cloudfront',
            title: 'S3 + CloudFront',
            summary: '雲端服務只扮演 Web Server「送靜態檔與 HTTPS」的部分，不能通用轉發請求；前端 SPA 常這樣部署。',
            host: 'AWS 代管',
            tags: ['S3', 'CloudFront', 'SPA'],
            related: ['object-storage', 'dns-cdn'],
          },
        ],
      },
      {
        title: 'Application Server 角色',
        topics: [
          {
            id: 'tomcat',
            title: 'Tomcat（Java）',
            summary:
              'Java 的 Servlet 容器：把 .war 丟進去，由它接請求、分派給你的程式；它自己也能聽 HTTP，所以同時能扮演 Web Server。',
            host: 'JVM → 作業系統 / 容器',
            tags: ['Servlet', '.war', '執行緒池', '8080'],
            related: ['embedded-as', 'java'],
          },
          {
            id: 'weblogic',
            title: 'WebLogic / WebSphere / JBoss',
            summary: '企業、金融業常見的 Java EE Application Server，提供交易管理、連線池、叢集；常說的「AP Server」指的就是它。',
            host: 'JVM → 作業系統（公司自有機房常見）',
            tags: ['AP Server', 'Java EE', '.war / .ear'],
            related: ['tomcat', 'mainframe'],
          },
          {
            id: 'gunicorn',
            title: 'Gunicorn（Python）',
            summary: '開多個 worker 行程，把請求分給 Django / Flask 程式處理。',
            host: 'CPython → 作業系統 / 容器',
            tags: ['WSGI', 'Django', 'Flask'],
            related: ['python'],
          },
          {
            id: 'puma',
            title: 'Puma（Ruby）',
            summary: 'Ruby on Rails 預設的 Application Server，用多執行緒處理請求。',
            host: 'Ruby runtime → 作業系統 / 容器',
            tags: ['Rack', 'Rails'],
            related: ['rails'],
          },
          {
            id: 'embedded-as',
            title: '內嵌在程式裡：Spring Boot 內建 Tomcat、Node.js',
            summary:
              'Spring Boot 把 Tomcat 打包進一個 .jar，java -jar 就跑起來；Node.js 用 Express 寫 app.listen(3000)，程式本身就是 Application Server。',
            host: '語言 runtime（JVM、V8）→ 作業系統 / 容器',
            tags: ['Spring Boot', 'java -jar', 'Express', 'app.listen'],
            related: ['tomcat', 'nodejs', 'java'],
          },
          {
            id: 'as-in-webserver',
            title: '由 Web Server 兼任：Apache + mod_php、IIS + ASP.NET',
            summary: '程式直接跑在 Web Server 裡，是「Web Server 一般不是宿主」的例外。',
            host: 'Web Server → 作業系統',
            tags: ['mod_php', 'ASP.NET'],
            related: ['apache', 'iis'],
          },
          {
            id: 'as-platform',
            title: '由雲端平台扮演：AWS Lambda、Cloudflare Workers',
            summary: 'Serverless 時，接請求、把函式跑起來的都是平台；你只交出程式碼。',
            host: '供應商的執行平台',
            tags: ['Lambda', 'Workers'],
            related: ['serverless'],
          },
        ],
      },
    ],
  },

  {
    id: 'app',
    zone: 'path',
    title: '應用程式',
    summary: '自己寫的程式。',
    host: 'Application Server（Tomcat、Gunicorn、Puma；Node.js 程式自己就是）→ 語言 runtime（JVM、CPython、V8）→ 作業系統或容器；C++ 編譯成機器碼，直接跑在作業系統上。Web Server 一般不是宿主，只負責把請求轉過來；例外是 Apache + mod_php、IIS + ASP.NET。',
    sections: [
      {
        topics: [
          {
            id: 'languages',
            title: '程式語言（C++／Rust／JS／Python）',
            summary: '編譯式（C++、Rust → 機器碼）與直譯 / JIT 式（JS、Python → runtime）的差別，決定程式的宿主是作業系統還是語言 runtime。',
            tags: ['編譯', '直譯', 'JIT', 'GC'],
            related: ['host-runtime'],
          },
          {
            id: 'java',
            title: 'Java（JVM）',
            summary: '編譯成 bytecode，在 JVM 上執行；Spring Boot 是金融業後端的主流。',
            host: 'Application Server（Tomcat / WebLogic）→ JVM → 作業系統或容器',
            tags: ['JVM', 'Spring Boot', 'Maven / Gradle'],
            related: ['tomcat', 'embedded-as'],
          },
          {
            id: 'python',
            title: 'Python（CPython）',
            summary: '直譯式語言，Web 常用 Django / Flask / FastAPI；也是資料處理、ETL 的主力。',
            host: 'Gunicorn → CPython → 作業系統或容器',
            tags: ['CPython', 'Django', 'Flask', 'FastAPI'],
            related: ['gunicorn'],
          },
          {
            id: 'cpp',
            title: 'C++（機器碼）',
            summary: '編譯成機器碼，直接跑在作業系統上，中間沒有 runtime 這一層。',
            host: '作業系統',
            tags: ['編譯', '機器碼'],
            related: ['languages'],
          },
          {
            id: 'nodejs',
            title: 'Node.js（V8）',
            summary: '讓 JS 跑在伺服器上的 runtime（V8 + libuv），單執行緒事件迴圈；用 Express 寫的程式自己就是 Application Server。',
            host: 'V8 → 作業系統或容器',
            tags: ['V8', 'libuv', 'Express', 'npm'],
            related: ['embedded-as', 'javascript'],
          },
          {
            id: 'rails',
            title: 'Ruby on Rails',
            summary: 'Ruby 的全端 Web 框架，慣例優於設定；預設由 Puma 承載。',
            host: 'Puma → Ruby runtime → 作業系統或容器',
            tags: ['Ruby', 'Puma', 'MVC'],
            related: ['puma'],
          },
          {
            id: 'rust',
            title: 'Rust',
            summary: '編譯成機器碼、沒有 GC，用所有權系統在編譯期保證記憶體安全。',
            host: '作業系統',
            tags: ['所有權', '無 GC', '機器碼'],
            related: ['languages', 'cpp'],
          },
          {
            id: 'javascript',
            title: 'JS（JavaScript / TypeScript）',
            summary: '瀏覽器唯一原生的程式語言；在瀏覽器由 V8 等引擎執行，在伺服器由 Node.js 執行。',
            host: '瀏覽器 JS 引擎或 Node.js',
            tags: ['V8', 'TypeScript', 'ECMAScript'],
            related: ['web-frontend', 'nodejs'],
          },
        ],
      },
    ],
  },

  {
    id: 'data',
    zone: 'path',
    title: '資料與訊息服務',
    summary: '站在程式「後面」、由程式主動呼叫的服務：存資料、傳訊息。',
    host: '自架時跑在作業系統或容器上（PostgreSQL、Redis、MinIO、Kafka、RabbitMQ）；也可直接用雲端代管（RDS、ElastiCache、S3、SQS / SNS）。',
    sections: [
      {
        topics: [
          {
            id: 'database',
            title: '資料庫 Database（RDBMS / NoSQL）',
            summary: 'RDBMS 用表格、SQL 與交易（ACID）保證資料一致；NoSQL 用文件、鍵值等彈性結構換取擴展性。',
            host: '自架：作業系統或容器；代管：RDS',
            tags: ['PostgreSQL 5432', 'MySQL 3306', 'MongoDB 27017', 'RDS', 'DB2'],
            details: [
              '各資料庫有自己的 TCP 協定；JDBC / ODBC 是程式端的 API，不是網路協定。',
              '程式透過連線池連資料庫；RDS 支援 TLS，但不一定有開。',
            ],
            related: ['port-postgres', 'port-mysql', 'port-mongo'],
          },
          {
            id: 'cache',
            title: '快取 Cache（Redis）',
            summary: '把常用資料放在記憶體，減少打資料庫；也用來存 Session、做限流與分散式鎖。',
            host: '自架：作業系統或容器；代管：ElastiCache',
            tags: ['Redis 6379', 'ElastiCache', 'TTL'],
            related: ['port-redis', 'pubsub'],
          },
          {
            id: 'object-storage',
            title: '物件儲存 Object Storage',
            summary: '用 Key 存取檔案（圖片、備份、報表），容量幾乎無限、按量計費。',
            host: '自架：MinIO；代管：S3、Cloudflare R2',
            tags: ['S3', 'MinIO', 'R2'],
            related: ['s3-cloudfront'],
          },
          {
            id: 'mq',
            title: '訊息佇列 Message Queue',
            summary: '生產者把任務放進佇列、消費者慢慢處理：系統解耦、削峰、非同步。',
            host: '自架：RabbitMQ、Kafka；代管：SQS',
            tags: ['RabbitMQ', 'SQS', 'Kafka', 'ACK / NACK'],
            related: ['amqp', 'kafka-protocol'],
          },
          {
            id: 'pubsub',
            title: '發布訂閱 / 事件驅動 Pub-Sub / Event-driven',
            summary: '一則事件同時通知多個訂閱者，發布者不需要知道誰在聽。',
            host: '代管：SNS、EventBridge；自架：Kafka、Redis Pub/Sub',
            tags: ['SNS', 'EventBridge', 'Kafka', 'Redis Pub/Sub'],
            related: ['mq', 'mqtt'],
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  旁路與共通基礎                                                    */
  /* ================================================================ */
  {
    id: 'sidepath',
    zone: 'side',
    title: '旁路（不在主路徑上）',
    summary: '不在使用者請求的主路徑上：一條是「出去」的路（NAT Gateway），一條是「維運人員進來」的路（VPN、跳板機）。',
    sections: [
      {
        topics: [
          {
            id: 'nat-gateway',
            title: 'NAT Gateway',
            summary:
              'Private Subnet 裡的主機要主動連外（呼叫第三方 API、下載套件）時的出口；只出不進。做的是網路層（L3 / L4）的位址轉換，不看 HTTP 內容。',
            host: 'AWS 代管；自架的 NAT Instance 是一台 EC2 + Linux + iptables',
            tags: ['L3 / L4', 'Private Subnet', 'Internet Gateway'],
            details: ['路徑：Private Subnet 的主機 → 路由表 → NAT Gateway（放在 Public Subnet）→ Internet Gateway → 網際網路。'],
            related: ['router-nat', 'vpc'],
          },
          {
            id: 'vpn',
            title: 'VPN',
            summary: '在你的電腦和內網之間建一條加密隧道，連上後就像身在內網。IPsec、WireGuard 是 L3 隧道；SSL VPN 走 TLS。',
            host: 'AWS Client VPN / Site-to-Site（代管）；自架 OpenVPN、WireGuard；公司機房常是硬體防火牆內建（Fortinet、Palo Alto）',
            tags: ['IPsec', 'WireGuard', 'SSL VPN', 'OpenVPN'],
            related: ['tailscale'],
          },
          {
            id: 'bastion',
            title: '跳板機 Bastion',
            summary:
              '不是網路設備，是一台主機：放在 Public Subnet、只開 22 或 3389 給特定 IP；先登入它，再從它連進 Private Subnet 的主機或資料庫。',
            host: '你自己：一台虛擬機 + 作業系統 + SSH 伺服器',
            tags: ['SSH 22', 'RDP 3389'],
            related: ['ssh', 'ssm'],
          },
          {
            id: 'cf-tunnel',
            title: 'Cloudflare Tunnel',
            summary: '主機上的 cloudflared 主動往外連到 Cloudflare，外面的人透過 Cloudflare 進來，不用開任何 Inbound Port。',
            host: '兩端：你主機上的 cloudflared + Cloudflare 邊緣節點',
            tags: ['cloudflared', '由內往外連', '應用層'],
            related: ['cloudflare', 'router-nat'],
          },
          {
            id: 'tailscale',
            title: 'Tailscale',
            summary: '底層是 WireGuard（L3）；每台裝置裝 Tailscale，組成一張私人網路，裝置之間直接互連。服務從雲端搬回家用主機後，可以用它連回本機服務。',
            host: '每台裝置上的 Tailscale 程式；協調服務由 Tailscale 代管',
            tags: ['WireGuard', 'Mesh VPN'],
            related: ['vpn'],
          },
          {
            id: 'ssm',
            title: 'AWS SSM Session Manager',
            summary: '透過主機上的 SSM Agent 連進去，不用開 22 Port，也不用跳板機。',
            host: 'AWS 代管 + 主機上的 SSM Agent',
            tags: ['不開 Port', 'IAM 控管'],
            related: ['bastion', 'iam'],
          },
        ],
      },
    ],
  },

  {
    id: 'ports',
    zone: 'side',
    title: '共通基礎：網路埠 Port',
    summary:
      'Port 只是入口編號，預設值是慣例。真正的問題是：誰可以連？從哪個網路？要不要 TLS？經不經過 Proxy / Gateway？防火牆怎麼限？',
    sections: [
      {
        topics: [
          { id: 'port-http', title: '80 / 443', mono: true, summary: 'HTTP / HTTPS。對外通常只開這兩個。', tags: ['HTTP', 'HTTPS'], related: ['https'] },
          { id: 'port-ssh', title: '22', mono: true, summary: 'SSH：遠端登入 Linux、SFTP 也走這個 Port。不該對全世界開放。', tags: ['SSH', 'SFTP'], related: ['ssh', 'bastion'] },
          { id: 'port-mysql', title: '3306', mono: true, summary: 'MySQL。資料庫留在 Private network，不對外。', tags: ['MySQL'], related: ['database'] },
          { id: 'port-postgres', title: '5432', mono: true, summary: 'PostgreSQL 自己的 TCP 協定（可加 TLS）。', tags: ['PostgreSQL', 'RDS'], related: ['database'] },
          { id: 'port-redis', title: '6379', mono: true, summary: 'Redis（RESP 協定）。', tags: ['Redis'], related: ['cache'] },
          { id: 'port-mongo', title: '27017', mono: true, summary: 'MongoDB。', tags: ['MongoDB'], related: ['database'] },
          { id: 'port-kafka', title: '9092', mono: true, summary: 'Kafka Broker。', tags: ['Kafka'], related: ['kafka-protocol', 'mq'] },
          { id: 'port-mqtt', title: '1883', mono: true, summary: 'MQTT（加密版 MQTTS 是 8883）。', tags: ['MQTT'], related: ['mqtt'] },
          {
            id: 'ports-overview',
            title: 'Port 速查與診斷',
            summary: '常見 Port 對照、常見誤解、連不上時的診斷指令，以及從「知道 Port」到「設計網路邊界」的深度層級。',
            tables: [
              {
                columns: ['服務', '常見 Port'],
                rows: [
                  ['HTTP / HTTPS / SSH', '80 / 443 / 22'],
                  ['MySQL / PostgreSQL / MongoDB / Redis', '3306 / 5432 / 27017 / 6379'],
                  ['Kafka / Elasticsearch·OpenSearch', '9092 / 9200'],
                  ['Prometheus / Grafana / K8s API', '9090 / 3000 / 6443'],
                  ['MQTT / MQTTS', '1883 / 8883'],
                ],
              },
            ],
            details: [
              '常見誤解：Nginx 是 80 / 443（403 是 HTTP 狀態碼不是 Port）；8080 不是 Tomcat 專屬；Docker 2375 是未加密的 Remote API，絕不可對外。',
              '原則：Public interface 越少越好——對外只開 80 / 443，DB、Redis、Kafka 留在 Private network。',
              '流量分層：Internet → CDN / WAF → Load Balancer → Reverse Proxy / Ingress → API Gateway → App → Cache / Queue / DB。',
              '連不上時：ss -tulpen、lsof -i :PORT、curl -v、dig、ping、mtr。',
              '深度層級：L1 知道 Port → L2 知道服務在做什麼 → L3 服務間怎麼連 → L4 哪些能對外 → L5 設計 Network Boundary、Traffic Flow、Security、HA。',
            ],
            related: ['firewall'],
          },
        ],
      },
    ],
  },

  {
    id: 'protocols',
    zone: 'side',
    title: '共通基礎：通訊協定',
    summary: '協定是 Client 與 Server 之間「怎麼溝通」的規則。上層協定跑在下層協定上面，例如 WebSocket → HTTP 握手 → TLS → TCP → IP。',
    sections: [
      {
        title: '重點概念',
        topics: [
          {
            id: 'tls-termination',
            title: 'TLS 終止：HTTPS 整條線都加密嗎？',
            summary:
              '不是。HTTPS 只保證「一段連線」加密。每個需要看懂內容的節點（CDN、WAF、Load Balancer、反向代理）都會先解密，處理完再開一條新連線往下送；新連線加不加密看那個節點的設定。',
            tables: [
              {
                caption: '以情境 A 那條鏈為例（典型設定，實際以 CloudFormation 與 Cloudflare 後台為準）',
                columns: ['段落', '通常是', '說明'],
                rows: [
                  ['瀏覽器 → Cloudflare', 'HTTPS', '瀏覽器的鎖頭只代表這一段'],
                  ['Cloudflare → CloudFront / ALB', '看 SSL 模式', 'Flexible 是 HTTP（不安全）；Full / Full (strict) 是 HTTPS'],
                  ['CloudFront → ALB', '看 origin 設定', '可以設成 HTTPS only'],
                  ['ALB → ECS 容器', '常常是 HTTP', 'ALB 解密後，在 VPC 內網用明文傳給程式'],
                  ['程式 → 資料庫', '看設定', 'RDS 支援 TLS，但不一定有開'],
                ],
              },
            ],
            details: [
              '路由器、ISP 只轉送封包、不解密：看得到雙方 IP、SNI 網域、流量大小；看不到路徑、Header、內容、密碼。',
              '每一個做 TLS 終止的節點都看得到明文，所以用 Cloudflare 代理等於信任它看得到你的流量。',
              '整條都加密的三種做法：① 每段重新加密（TLS re-encryption）② TLS 穿透（L4 LB 只轉 TCP，後端自己處理 TLS，但 LB 不能依路徑分流）③ mTLS（服務互相驗證憑證，Service Mesh、零信任）。',
              '金融業資安規範常要求內網也要加密；「ALB 之後內網走 HTTP」在銀行可能過不了稽核。',
            ],
            related: ['tls', 'https', 'load-balancer', 'cloudflare'],
          },
          {
            id: 'home-pc-protocols',
            title: '家用電腦有這些協定的能力嗎？',
            summary:
              '大致有。作業系統都有 TCP/IP 協定堆疊；差別在有沒有裝對應的軟體，以及網路有沒有讓別人連進來。當用戶端每天都在用，當伺服器就要手動打開。',
            details: [
              '當用戶端：DNS、DHCP、NTP 由作業系統自動在跑；Polling、SSE、WebSocket、WebRTC 是瀏覽器內建；ssh、SFTP、RDP 用戶端、SMB 都內建。',
              '當伺服器：SSH 伺服器要安裝或打開「遠端登入」；RDP 被連入只有 Windows 專業版以上；macOS 內建的是螢幕共享（VNC）。',
              '訊息 / IoT 類完全沒內建，要自己裝 Broker（Mosquitto、EMQX、RabbitMQ、Kafka），Docker 一行就能跑。',
              '就算開了，外面也常連不進來：路由器 NAT、電信業者 CGNAT、電腦防火牆、電信業者擋特定 Port（例如 25）。所以通常改用 ngrok、Cloudflare Tunnel、Tailscale 繞過去。',
            ],
            related: ['router-nat', 'cf-tunnel', 'tailscale'],
          },
        ],
      },
      {
        title: '網路 / 傳輸',
        topics: [
          { id: 'ip', title: 'IP', summary: '只管「送到哪台機器」（位址、路由），不保證送達。IPv4 / IPv6。', host: '網路卡 / 實體網路', tags: ['IPv4', 'IPv6', 'L3'] },
          { id: 'icmp', title: 'ICMP', summary: '錯誤與診斷訊息。', host: '跑在 IP 上', tags: ['ping', 'traceroute'] },
          { id: 'tcp', title: 'TCP', summary: '連線導向、保證順序與送達（三向交握、重傳），較慢但可靠。', host: '跑在 IP 上', tags: ['三向交握', 'HTTP/1.1', 'HTTP/2', 'SSH', '資料庫連線'] },
          { id: 'udp', title: 'UDP', summary: '無連線、不保證送達，快且輕。', host: '跑在 IP 上', tags: ['DNS 查詢', '影音串流', '線上遊戲'] },
          { id: 'quic', title: 'QUIC', summary: '在 UDP 上自己做可靠傳輸並內建 TLS：建立連線更快、切換網路不斷線。', host: '跑在 UDP 上', tags: ['HTTP/3'] },
          { id: 'tls', title: 'TLS', summary: '加密 + 憑證驗證；加在任何協定前面都變成安全版（HTTPS、WSS、MQTTS）。握手時的 SNI 會帶出網域名稱。', host: '跑在 TCP 上（QUIC 內建）', tags: ['憑證', 'SNI', 'HTTPS', 'WSS', 'MQTTS'], related: ['tls-termination'] },
        ],
      },
      {
        title: '請求 / 回應',
        topics: [
          { id: 'http11', title: 'HTTP/1.1', summary: '一問一答；一條連線同時只處理一個請求。', host: '跑在 TCP 上', tags: ['網頁', 'API'] },
          { id: 'http2', title: 'HTTP/2', summary: '一條連線多個請求並行（multiplexing）、Header 壓縮。', host: '跑在 TCP + TLS 上', tags: ['multiplexing', 'gRPC 底層'] },
          { id: 'http3', title: 'HTTP/3', summary: '改走 QUIC，解決 TCP 掉一個封包整排卡住的問題，手機弱網更穩。', host: '跑在 QUIC（UDP）上', tags: ['CDN', 'Cloudflare'] },
          { id: 'https', title: 'HTTPS', summary: '就是 HTTP + TLS，不是另一種協定。', host: 'HTTP + TLS', tags: ['443'], related: ['tls-termination'] },
          { id: 'rest', title: 'REST', summary: '不是協定而是風格：URI 表示資源、Method 表示操作；最常見的 Web API。', host: '跑在 HTTP 上', tags: ['GET / POST / PUT / DELETE'] },
          { id: 'graphql', title: 'GraphQL', summary: 'Client 自己指定要哪些欄位，適合前端要聚合多種資料的頁面。', host: '跑在 HTTP 上', tags: ['Schema', 'Query'] },
          { id: 'grpc', title: 'gRPC', summary: '二進位（Protocol Buffers）、強型別合約、支援串流；瀏覽器不能直接用，多用在微服務之間。', host: '跑在 HTTP/2 上', tags: ['Protobuf', '微服務'] },
          { id: 'soap', title: 'SOAP', summary: '舊式、規範嚴格的 XML 協定；金融、保險、政府的舊系統介接常見。', host: '跑在 HTTP 上（XML）', tags: ['XML', 'WSDL'] },
        ],
      },
      {
        title: '即時 / 推播',
        topics: [
          { id: 'polling', title: 'Polling（Short / Long）', summary: 'Client 一直問「有新資料嗎」；Long Polling 是 Server 等到有資料才回應。最簡單的即時效果。', host: '跑在 HTTP 上' },
          { id: 'sse', title: 'SSE', summary: 'Server-Sent Events：單向，Server 持續推給 Client，會自動重連；適合通知、進度條、AI 逐字輸出。', host: '跑在 HTTP 上' },
          { id: 'websocket', title: 'WebSocket', summary: 'HTTP 握手後升級成長連線：雙向、低延遲；加密版是 WSS。聊天室、即時報價、Job 進度監聽。', host: 'HTTP 握手後升級（TCP）', tags: ['WSS', 'Upgrade'] },
          { id: 'webrtc', title: 'WebRTC', summary: '瀏覽器之間點對點直連，需要 Signaling 伺服器先幫忙對上；視訊會議、螢幕分享。', host: '以 UDP 為主', tags: ['P2P', 'Signaling', 'STUN / TURN'] },
        ],
      },
      {
        title: '訊息 / IoT',
        topics: [
          { id: 'mqtt', title: 'MQTT', summary: '發布訂閱、超輕量、支援 QoS 等級與斷線遺囑；需要 Broker（Mosquitto、EMQX）。IoT 設備、弱網路。', host: '跑在 TCP 上（也可走 WebSocket）', tags: ['1883', 'QoS', 'Broker'], related: ['port-mqtt', 'pubsub'] },
          { id: 'coap', title: 'CoAP', summary: '類似輕量版 HTTP，給資源極少的低功耗感測器。', host: '跑在 UDP 上' },
          { id: 'amqp', title: 'AMQP', summary: '企業級訊息佇列：路由規則、ACK / NACK 確認。', host: '跑在 TCP 上', tags: ['RabbitMQ'], related: ['mq'] },
          { id: 'kafka-protocol', title: 'Kafka Protocol', summary: '高吞吐、訊息可保存與重播；事件串流、Log 收集。', host: '跑在 TCP 上', tags: ['9092'], related: ['mq', 'pubsub'] },
          { id: 'stomp', title: 'STOMP', summary: '簡單的文字訊息協定，常見於 Spring WebSocket + 訊息佇列。', host: '跑在 TCP / WebSocket 上' },
        ],
      },
      {
        title: '基礎服務 / 管理',
        topics: [
          { id: 'dns', title: 'DNS', summary: '網域解析（53，UDP / TCP）。流量的第一站。', host: '作業系統內建用戶端', tags: ['53', 'dig'], related: ['dns-cdn'] },
          { id: 'dhcp', title: 'DHCP', summary: '自動分配 IP（67 / 68），開機連上網路時就在用。', tags: ['67 / 68'] },
          { id: 'ntp', title: 'NTP', summary: '校時（123）；排程、憑證有效期、Log 時間都靠它。', tags: ['123'] },
          { id: 'ssh', title: 'SSH', summary: '遠端登入 Linux（22）。', tags: ['22'], related: ['port-ssh', 'bastion'] },
          { id: 'rdp', title: 'RDP', summary: '遠端桌面登入 Windows Server（3389）。', tags: ['3389'], related: ['windows-server'] },
          { id: 'sftp', title: 'SFTP', summary: '走 SSH（22）的檔案傳輸；企業批次交換檔案常見。', tags: ['22'] },
          { id: 'ftp', title: 'FTP / FTPS', summary: '傳統檔案傳輸（21）；FTPS 是加 TLS 的版本。', tags: ['21'] },
          { id: 'smb', title: 'SMB', summary: 'Windows 網路芳鄰、NAS 共用資料夾（445）。', tags: ['445'] },
          { id: 'smtp', title: 'SMTP', summary: '寄信（25 / 587）；驗證信、忘記密碼信都用它。', tags: ['25 / 587'] },
          { id: 'imap', title: 'IMAP', summary: '收信，信件留在伺服器（993）。', tags: ['993'] },
          { id: 'pop3', title: 'POP3', summary: '收信，下載到本機（995）。', tags: ['995'] },
        ],
      },
      {
        title: '身分',
        topics: [
          { id: 'oauth2', title: 'OAuth 2.0', summary: '授權框架：讓第三方拿到「有限權限的 Access Token」，不用交出密碼。', host: '走 HTTPS', related: ['authn'] },
          { id: 'oidc', title: 'OIDC', summary: '在 OAuth 2.0 上加一層「登入」：多了 ID Token（JWT）說明你是誰。Keycloak 就是 OIDC 提供者。', host: '走 HTTPS', related: ['authn'] },
          { id: 'saml', title: 'SAML', summary: 'XML 格式的企業 SSO 協定，舊系統與大型企業常見。', host: '走 HTTPS（XML）' },
          { id: 'ldap', title: 'LDAP', summary: '公司帳號目錄（Active Directory）查詢協定（389 / 636）。', tags: ['389 / 636', 'Active Directory'] },
        ],
      },
    ],
  },

  {
    id: 'hostchain',
    zone: 'side',
    title: '宿主鏈（誰承載誰）',
    summary:
      '宿主 = 這個東西跑在什麼上面、由誰承載。由下往上一層承載一層；雲端上幾乎每一層都在別人的機器上，差別在「軟體誰維護」。',
    sections: [
      {
        note: '由下往上',
        flow: true,
        topics: [
          { id: 'host-physical', title: '實體機', summary: '真正的硬體：CPU、記憶體、網卡。雲端上它屬於 AWS / Cloudflare，在家則是你的電腦。', related: ['compute'] },
          { id: 'host-hypervisor', title: 'Hypervisor / VM', summary: '把一台實體機切成多台虛擬機（EC2、VPS）；Fargate 也是由 AWS 的虛擬化層隔離每個 Task。', related: ['compute'] },
          { id: 'host-os', title: '作業系統', summary: 'Linux、Windows Server、z/OS；核心負責 TCP/IP 協定堆疊，把收到的封包依 Port 交給行程。', related: ['linux', 'windows-server', 'mainframe'] },
          { id: 'host-container', title: '容器引擎', summary: 'Docker Engine 等：用命名空間隔離容器，共用主機的作業系統核心。', related: ['container'] },
          {
            id: 'host-runtime',
            title: '語言 runtime',
            summary: 'JVM、V8、CPython。C++ / Rust 編譯成機器碼，沒有這一層。',
            details: ['Tomcat、Gunicorn、Puma 本身也是跑在 runtime 上的程式，所以由下往上是 runtime → Application Server → 你的程式。'],
            related: ['languages', 'java'],
          },
          {
            id: 'host-server',
            title: 'Web Server / Application Server',
            summary:
              'Application Server 接住請求、呼叫你的程式（Tomcat、Gunicorn、Puma；Node.js 程式自己就是）。Web Server 一般不是宿主，只把請求轉過來；例外是 Apache + mod_php、IIS + ASP.NET。',
            related: ['web-app-server', 'embedded-as'],
          },
          { id: 'host-code', title: '你的程式', summary: 'Controller → Service → Repository：真正的業務邏輯。', related: ['java', 'nodejs'] },
        ],
      },
      {
        topics: [
          { id: 'host-serverless', title: 'Serverless：雲端平台直接承載', summary: 'Lambda、Workers 時，實體機到 runtime 全部由平台承載，你只交出函式。', related: ['serverless'] },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  橫切關注（每一層都會碰到）                                        */
  /* ================================================================ */
  {
    id: 'security',
    zone: 'cross',
    title: '橫切關注：資安',
    summary: '不是獨立的一層，而是分散在每一層的防護。',
    host: '網路層（WAF、防火牆規則）、應用層（登入、AuthN）、平台層（IAM、Secrets Manager）。',
    sections: [
      {
        topics: [
          {
            id: 'security-layers',
            title: '網路層防護：WAF · 防火牆規則 · DDoS 防護 · TLS',
            summary: '在流量進到程式之前擋掉攻擊：WAF 看內容、防火牆看 IP / Port、DDoS 防護吸收流量、TLS 保護傳輸。',
            related: ['waf', 'firewall', 'ddos', 'tls-termination'],
          },
          {
            id: 'authn',
            title: '身分驗證 AuthN',
            summary: '確認「你是誰」：登入、OAuth / OIDC、MFA。Keycloak 可以自架成身分提供者，簽發 JWT 給後端驗證。',
            tags: ['OAuth 2.0', 'OIDC', 'MFA', 'Keycloak', 'JWT'],
            related: ['oidc', 'oauth2', 'api-gateway'],
          },
          {
            id: 'iam',
            title: '權限 IAM',
            summary: '決定「你能做什麼」：RBAC（依角色授權）、最小權限原則。',
            tags: ['RBAC', '最小權限', 'AWS IAM'],
            related: ['authn', 'ssm'],
          },
          {
            id: 'secrets',
            title: '密鑰管理 Secrets',
            summary: '密碼與 API Key 不寫死在程式碼裡，改用環境變數、Vault、AWS Secrets Manager。',
            tags: ['環境變數', 'Vault', 'Secrets Manager'],
            related: ['cicd'],
          },
        ],
      },
    ],
  },

  {
    id: 'delivery',
    zone: 'cross',
    title: '橫切關注：交付與維運',
    summary: '把程式送上執行環境，並讓它持續健康運作；概念在 Linux + Nginx 或 Windows Server + IIS 都通用。',
    host: 'CI/CD → CI 平台；IaC → 在本機或 CI 上執行的 CLI，作用對象是雲端或主機；可觀測性 → 監控平台收集各層資料；排程 → 作業系統（cron、Windows 工作排程器）或 K8s / 雲端排程器。',
    sections: [
      {
        topics: [
          {
            id: 'cicd',
            title: 'CI/CD 工程交付流程（Ship Code to Production）',
            summary: '每次推上 Git 就自動測試、打包成 Artifact、部署；出事能快速 Rollback。',
            host: 'CI 平台（GitHub Actions、Jenkins、Azure DevOps）',
            tags: ['GitHub Actions', 'Jenkins', 'Azure DevOps', 'Artifact', 'Rollback'],
            related: ['git', 'iac'],
          },
          {
            id: 'iac',
            title: 'IaC 基礎設施即程式碼（Terraform）',
            summary: '用程式碼描述 VPC、Load Balancer、資料庫，進版控、可審查、可重建。',
            host: '在本機或 CI 上執行的 CLI，作用對象是雲端或主機',
            tags: ['Terraform', 'CloudFormation', 'Ansible'],
            related: ['aws', 'cicd'],
          },
          {
            id: 'observability',
            title: '可觀測性 Observability（含部署安全）',
            summary: '用 Logs、Metrics、Traces 看懂系統現在發生什麼；也包括 HTTPS 憑證（Let’s Encrypt + Certbot）這類部署安全。',
            host: '監控平台（Prometheus、CloudWatch）收集各層資料',
            tags: ['Logs', 'Metrics', 'Traces', 'Prometheus', 'Grafana', 'ELK', 'Loki', 'CloudWatch'],
            related: ['ports-overview'],
          },
          {
            id: 'scheduler',
            title: '排程 Scheduler（以 Linux cron 為主）',
            summary: '定時執行批次工作：對帳、報表、清資料。',
            host: '作業系統（cron、systemd timer、Windows 工作排程器）或 K8s / 雲端排程器',
            tags: ['cron', 'systemd timer', 'Windows 工作排程器', 'K8s CronJob', 'EventBridge Scheduler'],
            related: ['linux', 'ntp'],
          },
        ],
      },
    ],
  },

  /* ================================================================ */
  /*  供應商與知識                                                      */
  /* ================================================================ */
  {
    id: 'cloud',
    zone: 'knowledge',
    title: '雲端供應商',
    summary: '某家業者怎麼提供上面那些概念；概念看上面各層，這裡記業者的服務名稱與設定。',
    host: '供應商自己的資料中心與全球邊緣節點。',
    sections: [
      {
        topics: [
          {
            id: 'aws',
            title: '雲端架構（AWS）',
            summary: '把上面每一層對應到 AWS 的服務名稱。',
            tables: [
              {
                columns: ['概念', 'AWS 服務'],
                rows: [
                  ['DNS / CDN', 'Route 53 / CloudFront'],
                  ['WAF / DDoS 防護', 'AWS WAF / AWS Shield'],
                  ['虛擬網路、防火牆規則', 'VPC、Subnet、Security Group'],
                  ['Load Balancer', 'ALB（L7）、NLB（L4）'],
                  ['主機 / 容器 / Serverless', 'EC2 / ECS、Fargate、EKS / Lambda'],
                  ['資料庫 / 快取 / 物件儲存', 'RDS / ElastiCache / S3'],
                  ['訊息', 'SQS、SNS、EventBridge'],
                  ['IaC / 監控 / 密鑰', 'CloudFormation / CloudWatch / Secrets Manager'],
                ],
              },
            ],
            related: ['vpc', 'load-balancer', 'container'],
          },
          {
            id: 'cloudflare',
            title: 'Cloudflare',
            summary: '全球邊緣網路：DNS、CDN、WAF、DDoS 防護，以及 Workers、R2、Tunnel。SSL 模式決定 Cloudflare → 你的伺服器那一段有沒有加密。',
            tags: ['DNS', 'CDN', 'WAF', 'SSL 模式 Flexible / Full (strict)', 'Workers', 'R2', 'Tunnel'],
            related: ['dns-cdn', 'tls-termination', 'cf-tunnel'],
          },
          {
            id: 'gcp',
            title: 'GCP',
            summary: 'Google Cloud：Compute Engine、GKE、Cloud Run、Cloud SQL；概念與 AWS 一一對應。',
            tags: ['Compute Engine', 'GKE', 'Cloud Run', 'Cloud SQL'],
          },
          {
            id: 'azure',
            title: 'Azure',
            summary: '微軟雲：VM、AKS、App Service、Azure SQL；和 Windows Server、Active Directory、Azure DevOps 整合深，企業常見。',
            tags: ['AKS', 'App Service', 'Azure SQL', 'Entra ID'],
          },
        ],
      },
    ],
  },

  {
    id: 'cs',
    zone: 'knowledge',
    title: 'CS 理論與架構設計',
    summary: '貫穿所有層的理論與設計思維，不是軟體元件。',
    sections: [
      {
        topics: [
          {
            id: 'cs-fundamentals',
            title: '計算機基礎（OS／網路／記憶體／數學）',
            summary: '行程與執行緒、記憶體、網路分層、資料表示：理解上面每一層「為什麼這樣設計」的基礎。',
            related: ['tcp', 'host-os'],
          },
          {
            id: 'leetcode',
            title: 'LeetCode',
            summary: '資料結構與演算法練習。',
          },
          {
            id: 'system-design',
            title: '系統設計與架構',
            summary: '把上面的元件組成可擴展、高可用、安全的系統：快取、佇列、分片、讀寫分離、網路邊界。',
            related: ['load-balancer', 'cache', 'mq'],
          },
        ],
      },
    ],
  },

  {
    id: 'workflow',
    zone: 'knowledge',
    title: '開發流程與協作',
    summary: '上線前的「人與流程」：從寫 code、review 到合併進主線。',
    host: 'Git → 本機 + 代管平台（GitHub / GitLab）。',
    sections: [
      {
        topics: [
          { id: 'git', title: 'Git', summary: '分散式版本控制；分支、合併、回溯。', host: '本機 + 代管平台（GitHub / GitLab）', tags: ['GitHub', 'GitLab'], related: ['cicd'] },
          { id: 'code-review', title: 'Code Review', summary: '合併前由同事審查：正確性、可讀性、安全性。', tags: ['Pull Request', 'Merge Request'], related: ['git'] },
          { id: 'scrum', title: 'Scrum', summary: '以 Sprint 為單位的敏捷開發流程。', tags: ['Sprint', 'Daily', 'Retro'] },
        ],
      },
    ],
  },

  {
    id: 'devenv',
    zone: 'knowledge',
    title: '開發環境與工具',
    summary: '自己電腦上的工作台：還沒上線前在用的東西。',
    host: '自己的電腦。',
    sections: [
      {
        topics: [
          { id: 'local-env', title: '本機環境速查', summary: 'Node 版本管理、套件管理、編輯器設定。', tags: ['NVM', 'Homebrew', 'VS Code'], related: ['macos'] },
          { id: 'tools', title: '工具與平台筆記', summary: 'API 測試、套件管理、把本機服務暫時開給外面連的工具。', tags: ['Bruno', 'pnpm', 'ngrok', 'Dev Tunnels'], related: ['cf-tunnel'] },
          { id: 'links', title: '常用連結', summary: '文件、後台、工具的書籤。' },
        ],
      },
    ],
  },
]
