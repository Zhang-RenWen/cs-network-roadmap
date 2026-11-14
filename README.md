# 計算機科學、網路世界 Road Map

互動式教學網頁：看一個 HTTPS 請求怎麼從你的電腦走到資料庫、再走回來，以及路上每一層的知識點。

- **世界地圖**：筆記的全部知識點，依「請求路徑（由外而內，右欄是整條路徑共用的 Port、通訊協定、宿主鏈）→ 橫切關注（資安、交付與維運、故障地圖）→ 供應商與知識」排列；點任何知識點看說明、宿主、相關工具、延伸閱讀，以及它出現在封包旅程的哪一站。
- **封包旅程**：15 站的動畫路徑（雲端情境：Cloudflare → ALB → ECS Fargate → RDS）
  - 封包五層（L2 訊框、L3 IP、L4 TCP/UDP、TLS、L7 HTTP）在每一站是「讀取 / 封著不拆 / 加密看不到 / 在這裡拆開 / 在這裡改寫 / 不存在」，用信封層層包覆呈現
  - 每台機器內部的宿主鏈（實體機 → Hypervisor → 作業系統核心 → 容器 → runtime → Application Server → 你的程式）
  - TLS 加密段與內網明文段用不同線條標示（TLS 終止）
  - 每一站的「實體機器屬於誰、軟體誰維護、你要做什麼」

## 開發

```bash
npm install
npm run dev        # 開發伺服器
npm test           # Vitest：資料完整性、知識點涵蓋率、步驟邊界、互動
npm run lint       # oxlint
npm run build      # 型別檢查 + 打包到 dist/
```

需要 Node.js 20.19+ 或 22.12+。

## 操作

| 操作 | 方式 |
| --- | --- |
| 上一步 / 下一步 | `←` `→`、控制列按鈕、進度條 |
| 第一步 / 最後一步 | `Home` / `End` |
| 自動播放 | `空白鍵` 或「播放」按鈕（走到最後一步自動停） |
| 跳到某台機器 | 點插圖上的機器（再點一次跳到它的下一站） |
| 搜尋知識點 | 世界地圖按 `/` |
| 分享某一站 / 某個知識點 | 網址 `#/journey/7`、`#/map/tls-termination` |

## 專案結構

```
src/
  data/
    roadmap.ts               Road Map 全部分類與知識點（資料驅動）
    scenarios/cloud-aws.ts   情境 A：節點、線段、15 個步驟、寬 / 窄兩種版面座標
    scenarios/index.ts       情境清單（新增情境只要加資料檔）
  components/
    map/                     RoadMapView、GroupCard、TopicDetail（抽屜）
    journey/                 JourneyView、JourneyMap（SVG）、MachineIcon、PacketLayers、HostStack、StepControls
  lib/                       步驟導覽、知識點索引與搜尋、SVG 幾何、封包層定義
  hooks/                     hash 路由、主題、media query
  styles/                    色彩 token（淺色 / 深色）與各頁樣式
```

### 資料格式重點

- 步驟的五層狀態用 5 個字元表示，依序為 L2、L3、L4、TLS、L7，例如 `'rrree'`（型別層級檢查，打錯字會編譯失敗）：
  `h` 讀取、`s` 封著不拆、`e` 加密看不到、`o` 在這裡拆開、`r` 在這裡改寫、`n` 不存在。
- `hostLayer` 是宿主鏈中目前所在的層（由下往上的 index，可給陣列）。
- `topics` 把步驟連到世界地圖的知識點，知識點抽屜會反向列出「在封包旅程中」的步驟。
- 分類的 `parent`：Port、通訊協定、宿主鏈這類「整條路徑都會用到」的卡片，掛在所屬的請求路徑分類底下，顯示在地圖右欄。
- 知識點的 `links`：延伸閱讀，只放公開網站（例如 Modern WEB Dev Notes），測試會擋掉 Notion 連結。
- 插圖座標分 `wide`（桌面）與 `narrow`（手機直式）兩套，畫面寬度 ≤ 640px 時切換。

## 部署到 GitHub Pages

`.github/workflows/deploy.yml` 會在 push 到 `main` 時跑 lint、測試、打包並部署。第一次使用：

1. 在 GitHub 建立 repo `network-world-map` 並 push。
2. Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。

Vite 設定 `base: './'` 加上 hash 路由，部署在任何子路徑都能運作，不需要 404 fallback。

## 內容說明

- 路徑中的設定（Cloudflare SSL 模式 Full (strict)、ALB → 容器走明文、RDS for PostgreSQL 15 起預設強制 TLS）是**典型設定，實際依環境而定**，畫面上都有標示。HTTP 一律畫成 HTTP/1.1 的文字格式，瀏覽器 ↔ Cloudflare 實際多半是 HTTP/2 或 HTTP/3。

## 第二階段（規劃中）

資料結構已支援多情境，新增資料檔放進 `src/data/scenarios/index.ts` 即可：

- 情境 B：銀行自有機房 On-Premise（硬體防火牆、F5、Web Server + WebLogic、DB2 / Mainframe、內網加密）
- 情境 C：家用主機 + Tailscale / Cloudflare Tunnel（由內往外連，不開 Inbound Port）
- 協定切換：WebSocket、MQTT（經 Broker）、DNS 查詢流程
- Cloudflare SSL 模式 Flexible / Full (strict) 開關，即時看出哪一段變明文
