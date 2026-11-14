import type { Scenario } from '../../types'

const BROWSER_STACK = [
  '實體機（筆電、Wi-Fi 網卡）',
  '作業系統核心 macOS：TCP/IP 協定堆疊',
  '瀏覽器 Chrome：TLS、HTTP、導轉、Cookie',
  'JS 引擎 V8',
  '前端程式 React + OIDC 程式庫',
]

const IDP_STACK = [
  '雲端實體機',
  'Hypervisor：每個容器 Task 一個隔離的 microVM',
  '作業系統核心 Linux：TCP/IP 協定堆疊',
  '容器執行環境',
  '語言 runtime：JVM',
  '身分服務 Keycloak',
  '你的 Realm 設定：Client、Redirect URI、登入流程',
]

const API_STACK = [
  'AWS 實體機',
  'Hypervisor：每個 Fargate Task 一個隔離的 microVM',
  '作業系統核心 Linux：TCP/IP 協定堆疊',
  '容器執行環境：網路命名空間（awsvpc）',
  '語言 runtime：JVM',
  'Application Server：Spring Boot 內建 Tomcat + Spring Security',
  '你的程式：Controller → Service → Repository',
]

/**
 * 情境 B：登入（OIDC 授權碼流程 + PKCE）
 * 瀏覽器 → 反向代理 → 身分服務 IdP（可再串 Google）→ 拿 token → 呼叫你的 API → 資料庫
 */
export const loginOidc: Scenario = {
  id: 'login-oidc',
  tab: '情境 B：登入流程',
  title: '情境 B：登入（OIDC 授權碼 + PKCE）',
  subtitle: '瀏覽器 → 身分服務 IdP（可再串 Google）→ 拿到 token → 呼叫你的 API',
  disclaimer: '以 Keycloak 當 IdP、Spring Boot 當 API 為例；DNS、CDN 等網路細節見情境 A，這裡省略。',

  nodes: [
    {
      id: 'browser',
      kind: 'laptop',
      label: '你的瀏覽器',
      stack: BROWSER_STACK,
      owner: { machine: '你自己', software: 'Apple（macOS）、Google（Chrome）', you: '前端整合 OIDC 程式庫、保管 token' },
    },
    {
      id: 'proxy',
      kind: 'loadbalancer',
      label: '反向代理 / ALB',
      stack: ['雲端機房', 'ALB 代管服務', 'Listener：依 Host 分流、轉送 X-Forwarded-*'],
      owner: { machine: 'AWS', software: 'AWS', you: '設定 Host 規則、憑證、健康檢查' },
    },
    {
      id: 'idp',
      kind: 'server',
      label: '身分服務 IdP',
      stack: IDP_STACK,
      owner: {
        machine: '雲端供應商（容器服務）',
        software: 'Keycloak 開源社群；版本升級、修補由你負責',
        you: '設定 Realm、Client、Redirect URI、MFA、外部登入',
      },
    },
    {
      id: 'google',
      kind: 'internet',
      label: 'Google（外部 IdP）',
      stack: ['Google 資料中心', 'Google 帳號服務（OIDC 提供者）', '你在 Google Cloud Console 建的 OAuth Client'],
      owner: { machine: 'Google', software: 'Google', you: '建 OAuth Client、登記 Redirect URI' },
    },
    {
      id: 'api',
      kind: 'server',
      label: '你的 API',
      stack: API_STACK,
      owner: {
        machine: 'AWS（Fargate 連機器都由 AWS 管）',
        software: 'AWS 管到容器執行環境；映像檔裡的東西是你的',
        you: '設定信任哪個 issuer、驗 token、對應權限',
      },
    },
    {
      id: 'db',
      kind: 'database',
      label: '使用者資料庫',
      stack: ['AWS 實體機', 'RDS 代管服務', 'PostgreSQL 引擎', '你的 Schema：users、user_identity（issuer + subject）'],
      owner: { machine: 'AWS', software: 'AWS 代管（修補、備份）', you: '設計使用者與身分對應的資料表、管權限' },
    },
  ],

  segments: [
    { id: 'browser-proxy', from: 'browser', to: 'proxy', kind: 'tls', tunnel: 'tls' },
    { id: 'proxy-idp', from: 'proxy', to: 'idp', kind: 'plain', tunnel: 'plain' },
    { id: 'proxy-api', from: 'proxy', to: 'api', kind: 'plain', tunnel: 'plain' },
    { id: 'browser-google', from: 'browser', to: 'google', kind: 'tls', tunnel: 'google', label: '前台導轉' },
    { id: 'idp-google', from: 'idp', to: 'google', kind: 'tls', tunnel: 'google', label: '後台換 token' },
    { id: 'api-idp', from: 'api', to: 'idp', kind: 'plain', label: 'JWKS 公鑰' },
    { id: 'api-db', from: 'api', to: 'db', kind: 'db', label: '5432' },
  ],

  tunnels: [
    { id: 'tls', kind: 'tls', label: 'TLS 加密', description: '瀏覽器 ↔ 反向代理：瀏覽器的鎖頭只代表這一段' },
    { id: 'plain', kind: 'plain', label: '明文（VPC 內）', description: '反向代理 → IdP / API：VPC 內常以明文傳送（典型設定）' },
    {
      id: 'google',
      kind: 'tls',
      label: 'TLS（Google）',
      description: '瀏覽器 ↔ Google 是前台導轉；IdP ↔ Google 是後台直接用授權碼換 token',
    },
  ],

  defaultFields: {
    l2: '訊框：每一段網路重新包一次（MAC 只在同一段有效）',
    l3: '203.0.113.7（你家對外 IP）→ 反向代理的公開 IP',
    l4: 'TCP :52814 → :443',
    tls: 'TLS 1.3 · AES-GCM 密文',
    l7: 'GET /authorize?… HTTP/1.1\nHost: auth.example.com',
  },

  steps: [
    {
      id: 'start-login',
      node: 'browser',
      title: '還沒登入：產生 PKCE、state、nonce',
      description:
        '使用者打開 app.example.com/orders，前端的 OIDC 程式庫發現記憶體裡沒有 Access Token，先記住原本的網址（含 query 與 hash），再產生一個只留在瀏覽器的隨機字串 code_verifier，算出它的 SHA-256 雜湊 code_challenge。另外產生 state（防 CSRF）和 nonce（防 ID Token 重放）。SPA 放不了 client secret，PKCE 就是用來代替它的。',
      layers: 'nnnnh',
      layerNames: { l7: 'OIDC 程式庫（瀏覽器內）' },
      fields: {
        l7: 'code_verifier = 隨機 43～128 字元（只留在瀏覽器）\ncode_challenge = BASE64URL(SHA-256(code_verifier))\nstate、nonce = 隨機值；記住原網址 /orders',
      },
      hostLayer: 4,
      topics: ['pkce', 'oauth-oidc', 'web-frontend'],
      failure: {
        symptom: 'crypto.subtle is undefined，按登入沒反應',
        detail: '用區網 IP 走 HTTP 開發時，瀏覽器不算安全環境，算不了 SHA-256。改用 localhost 或 HTTPS。',
        topic: 'ts-lan-dev',
      },
    },
    {
      id: 'authorize',
      node: 'proxy',
      title: '整頁導向 IdP：反向代理依 Host 分流',
      description:
        '瀏覽器整頁導到 https://auth.example.com/authorize，網址帶上 client_id、redirect_uri、scope=openid、code_challenge、state、nonce。請求先到反向代理（ALB）：在這裡終止 TLS，依 Host 把 auth.example.com 轉給 IdP，並加上 X-Forwarded-Proto: https，告訴後面「使用者原本走的是 HTTPS」。',
      layers: 'ooooo',
      fields: {
        tls: 'TLS 在這裡解密（auth.example.com 的憑證）',
        l7: 'GET /authorize?response_type=code&client_id=web-app\n  &redirect_uri=https://app.example.com/callback\n  &scope=openid&code_challenge=E9Mel…&state=af0i…\n→ Host: auth.example.com → IdP（加上 X-Forwarded-Proto）',
      },
      hostLayer: 2,
      segments: ['browser-proxy'],
      topics: ['pkce', 'reverse-proxy', 'load-balancer', 'tls-termination'],
      failure: {
        symptom: '登入後無限重導，或 callback 網址變成 http://',
        detail: '反向代理沒轉送 X-Forwarded-Proto / Host，或 IdP 不信任這層代理，以為自己跑在 http 上，產生錯的網址。',
        topic: 'ts-redirect-loop',
      },
    },
    {
      id: 'login-page',
      node: 'idp',
      title: 'IdP 檢查 Client 與 redirect_uri，顯示登入頁',
      description:
        'IdP 確認 client_id 存在、redirect_uri 和登記的完全一致（不接受萬用字元），把 code_challenge、state 記在這次登入的流程裡，回傳登入頁。使用者可以輸入帳密，或選「用 Google 登入」。已經在 IdP 登入過（SSO）的話，不會再顯示登入頁，直接進到第 5 站。',
      layers: 'nnnno',
      fields: {
        l7: 'GET /authorize?…（X-Forwarded-Proto: https）\n✓ client_id = web-app\n✓ redirect_uri 和登記的完全一致\n← 200 登入頁（Set-Cookie：IdP 自己的登入 session）',
      },
      hostLayer: [5, 6],
      segments: ['proxy-idp'],
      topics: ['pkce', 'oauth-oidc'],
      failure: {
        symptom: 'Invalid parameter: redirect_uri',
        detail: '多一個斜線、http 和 https 不同、換了網域或 Port（例如改用區網 IP、Tailscale 網址開），都算不一致。每多一種對外網址，就要在 IdP 多登記一個。',
        topic: 'pkce',
      },
    },
    {
      id: 'google',
      node: 'google',
      title: '用 Google 登入：IdP 再去問 Google',
      description:
        '這時 IdP 變成 Google 的用戶端：瀏覽器被導到 Google 登入，Google 驗證完把瀏覽器導回 IdP 的 broker 端點；IdP 在背後（後台直連）用授權碼向 Google 換 token、驗 Google 的 ID Token。你的 API 完全看不到 Google 的 token。第一次用 Google 登入時，要先輸入原本的密碼才連結到既有帳號，只因 Email 相同就合併會有帳號被接管的風險。',
      layers: 'ooooo',
      fields: {
        l3: '203.0.113.7 → accounts.google.com 的 IP',
        tls: 'TLS（Google 的憑證）',
        l7: '瀏覽器 → accounts.google.com 登入\n← 導回 https://auth.example.com/…/broker/google/endpoint?code=…\nIdP → Google：用 code 換 token（後台直連）\n✓ Google 的 ID Token：sub、email_verified',
      },
      hostLayer: [1, 2],
      segments: ['browser-google', 'idp-google'],
      topics: ['identity-broker', 'oidc'],
      failure: {
        symptom: 'Error 400: redirect_uri_mismatch（Google 的錯誤頁）',
        detail: 'Google Cloud Console 的 OAuth Client 沒有登記 IdP 的 broker 網址；換了網域或改用區網、Tailscale 網址時，都要補登記。',
        topic: 'identity-broker',
      },
    },
    {
      id: 'issue-code',
      node: 'browser',
      title: '帶著授權碼導回前端，檢查 state',
      description:
        'IdP 驗證成功（帳密或 Google，加上 MFA）後回 302，把瀏覽器導回 redirect_uri，網址上帶一次性的授權碼 code 和原本的 state。前端先確認 state 和自己送出去的一樣，不一樣就丟掉（可能是 CSRF）。授權碼本身還不是 token，而且很快就失效。',
      layers: 'ooooo',
      fields: {
        l3: '反向代理 → 203.0.113.7（路由器再依 NAT 表換回 192.168.1.23）',
        l4: 'TCP :443 → :52814',
        tls: 'TLS 在瀏覽器解密',
        l7: 'HTTP/1.1 302 Found\nLocation: https://app.example.com/callback\n  ?code=SplxlOBe…&state=af0i…\n✓ state 和送出去的一樣',
      },
      hostLayer: [2, 4],
      segments: ['proxy-idp', 'browser-proxy'],
      direction: 'back',
      topics: ['pkce', 'browser-security'],
      failure: {
        symptom: 'state 不符，登入回來又被要求登入',
        detail: '存 state 的地方不見了（換了分頁、sessionStorage 被清），或兩個登入流程同時在跑（例如 React StrictMode 讓初始化執行兩次）。',
        topic: 'pkce',
      },
    },
    {
      id: 'token-exchange',
      node: 'idp',
      title: '用授權碼 + code_verifier 換 token',
      description:
        '前端用 POST 把 code 和當初的 code_verifier 送到 IdP 的 token 端點（跨來源請求，IdP 要允許 app.example.com 這個來源）。IdP 算 SHA-256(code_verifier)，和第 2 站收到的 code_challenge 相符才發 token。就算授權碼在網址上被偷看到，沒有 code_verifier 也換不到。',
      layers: 'nnnno',
      fields: {
        l7: 'POST /token\ngrant_type=authorization_code&code=SplxlOBe…\n  &code_verifier=dBjftJeZ…\n✓ SHA-256(code_verifier) = code_challenge',
      },
      hostLayer: 5,
      segments: ['browser-proxy', 'proxy-idp'],
      topics: ['pkce', 'token-types'],
      failure: {
        symptom: 'invalid_grant',
        detail: '授權碼過期或已經用過（只能換一次）、code_verifier 對不上，或這次送的 redirect_uri 和第 2 站不同。',
        topic: 'pkce',
      },
    },
    {
      id: 'tokens',
      node: 'browser',
      title: '拿到三種 token，各有各的用途',
      description:
        'IdP 回傳 ID Token（給前端知道你是誰，先驗 nonce）、Access Token（短效，呼叫 API 用）和 Refresh Token（換新的 Access Token）。Access Token 放在記憶體，不放 localStorage，避免被 XSS 讀走；重新整理頁面後，用 IdP 的登入 session 靜默換回來。',
      layers: 'ooooo',
      fields: {
        l3: '反向代理 → 203.0.113.7 → 192.168.1.23',
        l4: 'TCP :443 → :52814',
        tls: 'TLS 在瀏覽器解密',
        l7: '{ "id_token": "eyJ…"（給前端：sub、name、nonce）,\n  "access_token": "eyJ…"（給 API，expires_in: 300）,\n  "refresh_token": "…" }\n→ 導回第 1 站記住的 /orders',
      },
      hostLayer: 4,
      segments: ['proxy-idp', 'browser-proxy'],
      direction: 'back',
      topics: ['token-types', 'session-jwt', 'browser-security'],
      failure: {
        symptom: '閒置一下就被登出',
        detail: 'Access Token 過期後沒有用 Refresh Token 或靜默登入換新；或多個 App 各自計算閒置時間，互相觸發全域登出。閒置與最長期限應該統一交給 IdP 的 session 設定。',
        topic: 'token-types',
      },
    },
    {
      id: 'call-api',
      node: 'proxy',
      title: '帶 Access Token 呼叫 API',
      description:
        '前端呼叫 https://api.example.com/orders，在 Header 帶 Authorization: Bearer <Access Token>。前端和 API 不同源，帶 Authorization 的請求會先送一個預檢（OPTIONS）。反向代理一樣在這裡終止 TLS，依 Host 轉給 API；它不檢查 token，只負責轉送。',
      layers: 'ooooo',
      fields: {
        tls: 'TLS 在這裡解密（api.example.com 的憑證）',
        l7: 'GET /orders HTTP/1.1\nHost: api.example.com\nOrigin: https://app.example.com\nAuthorization: Bearer eyJhbGciOiJSUzI1NiIs…',
      },
      hostLayer: 2,
      segments: ['browser-proxy'],
      topics: ['token-types', 'load-balancer', 'browser-security'],
      failure: {
        symptom: 'CORS error',
        detail: 'API 沒回 Access-Control-Allow-Origin，或沒處理帶 Authorization 的預檢請求（OPTIONS）。把 API 放在同一個網域底下（CDN 把 /api/* 轉給 API）就沒有這個問題。',
        topic: 'ts-cors',
      },
    },
    {
      id: 'verify-jwt',
      node: 'api',
      title: 'API 驗 Access Token：簽章、iss、aud、exp',
      description:
        'Spring Security 依 token 的 kid，用 IdP 公開的 JWKS 公鑰驗簽章，再檢查 iss 是不是自己信任的 IdP、aud 是不是給這個 API、exp 有沒有過期。只 decode 不驗簽章等於沒驗；ID Token 也不能拿來當 Access Token。',
      layers: 'nnnno',
      fields: {
        l7: 'Authorization: Bearer eyJ…\n✓ 簽章（JWKS 公鑰，kid = 7Hk…）\n✓ iss = https://auth.example.com/realms/app\n✓ aud = orders-api · exp 未過期',
      },
      hostLayer: 5,
      segments: ['proxy-api', 'api-idp'],
      topics: ['jwt-verify', 'session-jwt', 'ts-auth'],
      note: '公鑰會快取，不是每個請求都去 IdP 拿。實際上常走 IdP 的公開網址（https://auth.example.com/…/certs），從私有子網出去要經過 NAT；這裡畫成一條線簡化。',
      failure: {
        symptom: '401 Unauthorized',
        detail: 'token 過期、aud 不是給這個 API、iss 對不上（IdP 換了對外網址，舊 token 的 iss 還是舊的），或伺服器時鐘誤差太大。',
        topic: 'ts-auth',
      },
    },
    {
      id: 'lookup-user',
      node: 'db',
      title: '用 (issuer, subject) 找到內部使用者與權限',
      description:
        'token 裡的 sub 是 IdP 給的、不會變的使用者 ID。API 用 (iss, sub) 這一組到資料庫找內部使用者與角色（RBAC），而不是用 Email：Email 會改，不同 IdP 的同一個 Email 也不一定是同一個人。',
      layers: 'ooooo',
      layerNames: { l7: 'PostgreSQL 協定（SQL）' },
      fields: {
        l2: 'VPC 虛擬網路的訊框',
        l3: '10.0.2.40（API）→ 10.0.3.15（資料庫，Private Subnet）',
        l4: 'TCP :45678 → :5432',
        tls: '依資料庫設定（建議強制 TLS）',
        l7: 'SELECT u.id, r.name FROM user_identity i\n  JOIN users u ON … JOIN roles r ON …\n WHERE i.issuer = $1 AND i.subject = $2',
      },
      hostLayer: [2, 3],
      segments: ['api-db'],
      topics: ['identity-broker', 'iam', 'database'],
      failure: {
        symptom: '登入成功，卻沒有任何權限（403）',
        detail: 'IdP 換了對外網址，issuer 跟著變了，資料庫存的還是舊的 issuer，(issuer, subject) 對不到帳號。',
        topic: 'ts-auth',
      },
    },
    {
      id: 'response',
      node: 'browser',
      title: '回應資料，畫面顯示',
      description:
        'API 確認權限後回傳 JSON，經反向代理回到瀏覽器，帶著允許 app.example.com 讀取的 CORS 標頭。之後 Access Token 過期，前端在背景用 Refresh Token（或 IdP 的登入 session）換一張新的，使用者不會察覺。',
      layers: 'ooooo',
      fields: {
        l3: '反向代理 → 203.0.113.7 → 192.168.1.23',
        l4: 'TCP :443 → :52814',
        tls: 'TLS 在瀏覽器解密',
        l7: 'HTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://app.example.com\nContent-Type: application/json\n{ "orders": … }',
      },
      hostLayer: [2, 4],
      segments: ['api-db', 'proxy-api', 'browser-proxy'],
      direction: 'back',
      topics: ['token-types', 'browser-security'],
      failure: {
        symptom: '登入過期了，畫面上還留著資料',
        detail: 'Refresh 失敗時沒有立刻清掉登入狀態、隱藏受保護的畫面；或改成自動重登，結果陷入重導迴圈。',
        topic: 'token-types',
      },
    },
  ],

  layouts: {
    wide: {
      width: 860,
      height: 380,
      labelSide: 'below',
      packetSide: 'above',
      nodes: {
        browser: { x: 64, y: 214 },
        google: { x: 230, y: 70 },
        proxy: { x: 340, y: 214 },
        idp: { x: 560, y: 124, labelSide: 'right', packetSide: 'left' },
        api: { x: 560, y: 304, packetSide: 'left' },
        db: { x: 770, y: 304 },
      },
      zones: [
        { id: 'home', label: '你家', tone: 'home', x: 10, y: 150, w: 112, h: 126, labelPos: { x: 20, y: 168 } },
        { id: 'vpc', label: '雲端 VPC（私有網路）', tone: 'cloud', x: 284, y: 30, w: 572, h: 340, labelPos: { x: 846, y: 50, anchor: 'end' } },
        { id: 'public', label: 'Public Subnet', tone: 'subnet', x: 294, y: 150, w: 102, h: 128, labelPos: { x: 302, y: 167 } },
        { id: 'private', label: 'Private Subnet', tone: 'subnet', x: 474, y: 80, w: 372, h: 280, labelPos: { x: 838, y: 97, anchor: 'end' } },
      ],
      via: {
        'browser-google': [{ x: 64, y: 70 }],
        'idp-google': [{ x: 560, y: 70 }],
        'proxy-idp': [
          { x: 450, y: 214 },
          { x: 450, y: 124 },
        ],
        'proxy-api': [
          { x: 450, y: 214 },
          { x: 450, y: 304 },
        ],
      },
      segmentLabels: {
        'browser-google': { x: 74, y: 140, anchor: 'start' },
        'idp-google': { x: 480, y: 62 },
        'api-idp': { x: 570, y: 218, anchor: 'start' },
        'api-db': { x: 665, y: 296 },
      },
      tunnelLabels: {
        tls: { x: 200, y: 204 },
        plain: { x: 404, y: 346, anchor: 'start' },
        google: { x: 344, y: 62 },
      },
    },
    narrow: {
      width: 360,
      height: 700,
      labelSide: 'right',
      packetSide: 'left',
      nodes: {
        browser: { x: 84, y: 70, label: { x: 126, y: 104 } },
        google: { x: 270, y: 70, labelSide: 'below' },
        proxy: { x: 84, y: 230, label: { x: 122, y: 219 } },
        idp: { x: 270, y: 330, labelSide: 'left', packetSide: 'above' },
        api: { x: 84, y: 470, label: { x: 122, y: 458 } },
        db: { x: 84, y: 640 },
      },
      zones: [
        { id: 'home', label: '你家', tone: 'home', x: 10, y: 28, w: 196, h: 96, labelPos: { x: 196, y: 118, anchor: 'end' } },
        { id: 'vpc', label: '雲端 VPC（私有網路）', tone: 'cloud', x: 10, y: 176, w: 340, h: 514, labelPos: { x: 326, y: 196, anchor: 'end' } },
        { id: 'public', label: 'Public Subnet', tone: 'subnet', x: 24, y: 204, w: 206, h: 66, labelPos: { x: 222, y: 262, anchor: 'end' } },
        { id: 'private', label: 'Private Subnet', tone: 'subnet', x: 24, y: 288, w: 322, h: 394, labelPos: { x: 338, y: 674, anchor: 'end' } },
      ],
      via: {
        'proxy-idp': [{ x: 270, y: 230 }],
        'idp-google': [
          { x: 336, y: 330 },
          { x: 336, y: 70 },
        ],
        'api-idp': [{ x: 270, y: 470 }],
      },
      segmentLabels: {
        'idp-google': { x: 328, y: 150, anchor: 'end' },
        'api-idp': { x: 190, y: 490 },
        'api-db': { x: 94, y: 560, anchor: 'start' },
      },
      tunnelLabels: {
        tls: { x: 100, y: 160, anchor: 'start' },
        plain: { x: 100, y: 410, anchor: 'start' },
        google: { x: 177, y: 58 },
      },
    },
  },
}
