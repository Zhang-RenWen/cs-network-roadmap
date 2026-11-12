import { useLayoutEffect, useRef, useState } from 'react'

/** 最小縮放比例：再小字就讀不到了，寧可讓頁面捲動 */
const MIN_ZOOM = 0.4
/** 預留幾個 px，避免捨入誤差多出一條捲軸 */
const SAFETY_PX = 4

/**
 * 符合畫面：算出縮放比例，讓 ref 指向的區塊連同下方頁尾剛好放進視窗高度。
 * ref 掛在「沒有被縮放」的外層，內層再套用回傳的 zoom。
 *
 * 縮放會改變內部排版寬度、進而改變換行與高度，所以比例改完之後要再量一次。
 * 那一次只准縮小、不准放大：否則可能在「放大 → 變高 → 縮小 → 變矮 → 放大」之間無限來回。
 * 只有視窗尺寸改變或剛開啟時，才重新允許放大。
 */
export function useFitZoom<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  const [zoom, setZoom] = useState(1)
  // 畫面上實際套用中的比例（commit 之後才更新），用來把量到的高度換回原始尺寸
  const applied = useRef(zoom)

  useLayoutEffect(() => {
    applied.current = zoom
  }, [zoom])

  useLayoutEffect(() => {
    const el = ref.current
    if (!enabled || !el) return

    const measure = (mayGrow: boolean) => {
      const natural = el.offsetHeight / applied.current
      if (natural <= 0) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const main = el.parentElement
      const padBottom = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0
      const footer = document.querySelector<HTMLElement>('.app-footer')?.offsetHeight ?? 0
      const available = window.innerHeight - top - padBottom - footer - SAFETY_PX
      const next = Math.min(1, Math.max(MIN_ZOOM, Math.floor((available / natural) * 1000) / 1000))
      setZoom((prev) => {
        if (Math.abs(next - prev) < 0.002) return prev
        return next < prev || mayGrow ? next : prev
      })
    }

    const onResize = () => measure(true)
    measure(true)
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => measure(false))
    observer?.observe(el)
    window.addEventListener('resize', onResize)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [enabled])

  return { ref, zoom }
}
