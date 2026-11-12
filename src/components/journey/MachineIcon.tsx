import type { MachineKind } from '../../types'

/**
 * 機器插圖，全部以 (0, 0) 為中心繪製，大小對應 lib/geometry.ts 的 NODE_BOUNDS。
 * 顏色交給 CSS：.m-body 主體、.m-inner 內層、.m-line 線條、.m-led 指示燈、.m-text 文字。
 */
export function MachineIcon({ kind }: { kind: MachineKind }) {
  switch (kind) {
    case 'laptop':
      return (
        <g>
          <rect className="m-body" x={-26} y={-24} width={52} height={36} rx={4} />
          <rect className="m-inner" x={-21} y={-19} width={42} height={26} rx={2} />
          <path className="m-line" d="M-14 -11h16 M-14 -5h24 M-14 1h12" />
          <path className="m-body" d="M-34 14H34L30 21H-30Z" />
        </g>
      )
    case 'dns':
      return (
        <g>
          <rect className="m-body" x={-28} y={-17} width={56} height={34} rx={7} />
          <text className="m-text" y={1} textAnchor="middle" dominantBaseline="central">
            DNS
          </text>
        </g>
      )
    case 'router':
      return (
        <g>
          <path className="m-line" d="M-16 -6L-21 -24 M16 -6L21 -24" />
          <circle className="m-led" cx={-21} cy={-25} r={2.6} />
          <circle className="m-led" cx={21} cy={-25} r={2.6} />
          <rect className="m-body" x={-30} y={-7} width={60} height={23} rx={5} />
          <circle className="m-led" cx={-19} cy={4.5} r={2.2} />
          <circle className="m-led" cx={-11} cy={4.5} r={2.2} />
          <circle className="m-led" cx={-3} cy={4.5} r={2.2} />
          <path className="m-line" d="M8 4.5h14" />
        </g>
      )
    case 'internet':
      return (
        <g>
          <path
            className="m-body"
            d="M-26 20A14 14 0 0 1 -30 -6A18 18 0 0 1 -2 -22A16 16 0 0 1 26 -10A15 15 0 0 1 28 20Z"
          />
          <path className="m-line" d="M-18 6h36 M-10 -4h20" />
        </g>
      )
    case 'edge':
      return (
        <g>
          <path className="m-body" d="M0 -26L22 -18V0C22 14 12 22 0 27C-12 22 -22 14 -22 0V-18Z" />
          <text className="m-text m-text--small" y={1} textAnchor="middle" dominantBaseline="central">
            WAF
          </text>
        </g>
      )
    case 'firewall':
      return (
        <g>
          <rect className="m-body" x={-22} y={-20} width={44} height={40} rx={3} />
          <path
            className="m-line"
            d="M-22 -7H22 M-22 6H22 M-7 -20V-7 M8 -20V-7 M-14 -7V6 M0 -7V6 M14 -7V6 M-7 6V20 M8 6V20"
          />
        </g>
      )
    case 'loadbalancer':
      return (
        <g>
          <rect className="m-body" x={-28} y={-20} width={56} height={40} rx={8} />
          <path className="m-line" d="M-16 0H-4 M-4 0L10 -10 M-4 0H10 M-4 0L10 10" />
          <circle className="m-led" cx={-16} cy={0} r={2.6} />
          <circle className="m-led" cx={12} cy={-10} r={2.4} />
          <circle className="m-led" cx={12} cy={0} r={2.4} />
          <circle className="m-led" cx={12} cy={10} r={2.4} />
        </g>
      )
    case 'server':
      return (
        <g>
          <rect className="m-body" x={-30} y={-34} width={60} height={68} rx={5} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${-24 + i * 20})`}>
              <rect className="m-inner" x={-23} y={-2} width={46} height={14} rx={2} />
              <circle className="m-led" cx={-16} cy={5} r={2.2} />
              <path className="m-line" d="M-8 5H16" />
            </g>
          ))}
        </g>
      )
    case 'database':
      return (
        <g>
          <path className="m-body" d="M-24 -18V18A24 7 0 0 0 24 18V-18Z" />
          <path className="m-line" d="M-24 -5A24 7 0 0 0 24 -5 M-24 7A24 7 0 0 0 24 7" />
          <ellipse className="m-body" cx={0} cy={-18} rx={24} ry={7} />
        </g>
      )
  }
}
