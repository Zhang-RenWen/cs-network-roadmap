/** 把步驟 index 限制在 [0, total - 1]，不循環 */
export function clampStep(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), total - 1)
}

export const nextStep = (index: number, total: number) => clampStep(index + 1, total)
export const prevStep = (index: number, total: number) => clampStep(index - 1, total)
export const isFirstStep = (index: number) => index <= 0
export const isLastStep = (index: number, total: number) => index >= total - 1

/** 網址上的步驟是 1-based（#/journey/7）；無效時回到第一步 */
export function stepFromParam(param: string | undefined, total: number): number {
  if (!param) return 0
  const n = Number(param)
  if (!Number.isInteger(n)) return 0
  return clampStep(n - 1, total)
}

/**
 * 點插圖上的機器要跳到哪一步：
 * 不在這台機器 → 跳到它的第一步；已經在這台機器 → 跳到它的下一步（循環）
 */
export function stepAtNode(steps: { node: string }[], current: number, nodeId: string): number {
  const indices = steps.flatMap((s, i) => (s.node === nodeId ? [i] : []))
  if (indices.length === 0) return current
  if (steps[current]?.node !== nodeId) return indices[0]
  return indices.find((i) => i > current) ?? indices[0]
}
