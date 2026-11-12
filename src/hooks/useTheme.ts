import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'nwm-theme'

function readStoredMode(): ThemeMode {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    /* 私密視窗或封鎖儲存時，跟隨系統 */
  }
  return 'system'
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode)

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') delete root.dataset.theme
    else root.dataset.theme = mode
    try {
      if (mode === 'system') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* 忽略 */
    }
  }, [mode])

  const cycle = useCallback(() => {
    setMode((m) => (m === 'system' ? 'light' : m === 'light' ? 'dark' : 'system'))
  }, [])

  return { mode, cycle }
}
