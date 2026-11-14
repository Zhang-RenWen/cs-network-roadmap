export type IconName =
  | 'eye'
  | 'seal'
  | 'lock'
  | 'open'
  | 'pencil'
  | 'dash'
  | 'prev'
  | 'next'
  | 'play'
  | 'pause'
  | 'sun'
  | 'moon'
  | 'auto'
  | 'search'
  | 'close'
  | 'external'
  | 'route'
  | 'map'
  | 'fit'
  | 'alert'

const PATHS: Record<IconName, string> = {
  eye: 'M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  seal: 'M2 4.5h12v8H2z M2 4.5l6 4.5 6-4.5',
  lock: 'M4 7.5h8v6H4z M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2 M8 10v1.5',
  open: 'M2 7l6-4 6 4v6.5H2z M2 7l6 4 6-4',
  pencil: 'M10.5 2.5l3 3-8 8H2.5v-3z M9 4l3 3',
  dash: 'M4 8h8',
  prev: 'M10 3L5 8l5 5',
  next: 'M6 3l5 5-5 5',
  play: 'M5 3l8 5-8 5z',
  pause: 'M5 3v10 M11 3v10',
  sun: 'M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z M8 1.5v1.5 M8 13v1.5 M1.5 8H3 M13 8h1.5 M3.4 3.4l1 1 M11.6 11.6l1 1 M3.4 12.6l1-1 M11.6 4.4l1-1',
  moon: 'M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5Z',
  auto: 'M8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12Z M8 2v12',
  search: 'M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Z M10.5 10.5L14 14',
  close: 'M4 4l8 8 M12 4l-8 8',
  external: 'M9 2.5h4.5V7 M13.5 2.5L7.5 8.5 M11.5 9.5v4h-9v-9h4',
  route: 'M3.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M12.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M5 11.5h5a2 2 0 0 0 0-4H6a2 2 0 0 1 0-4h5',
  map: 'M1.5 3.5l4-1.5 5 1.5 4-1.5v10.5l-4 1.5-5-1.5-4 1.5z M5.5 2v10.5 M10.5 3.5V14',
  fit: 'M6 2v4H2 M10 2v4h4 M6 14v-4H2 M10 14v-4h4',
  alert: 'M8 2L14.5 13.5h-13z M8 6.5v3 M8 11.8v.2',
}

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const filled = name === 'play' || name === 'auto'
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'auto' ? (
        <>
          <path d="M8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12Z" />
          <path d="M8 2a6 6 0 0 1 0 12Z" fill="currentColor" stroke="none" />
        </>
      ) : (
        <path d={PATHS[name]} fill={filled ? 'currentColor' : 'none'} />
      )}
    </svg>
  )
}
