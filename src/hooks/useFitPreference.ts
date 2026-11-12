import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'nwm-journey-fit'

function readStored(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    /* 私密視窗或封鎖儲存時，預設開啟 */
    return true
  }
}

/** 封包旅程是否「符合畫面」（整頁縮小到一個畫面）；預設開啟，偏好記在瀏覽器 */
export function useFitPreference() {
  const [enabled, setEnabled] = useState(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      /* 忽略 */
    }
  }, [enabled])

  const toggle = useCallback(() => setEnabled((e) => !e), [])

  return { enabled, toggle }
}

export type FitPreference = ReturnType<typeof useFitPreference>
