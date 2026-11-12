import { describe, expect, it } from 'vitest'
import { clampStep, isFirstStep, isLastStep, nextStep, prevStep, stepAtNode, stepFromParam } from './stepNav'

describe('上一步 / 下一步邊界', () => {
  it('第一步按上一步停在第一步，不循環', () => {
    expect(prevStep(0, 15)).toBe(0)
    expect(isFirstStep(0)).toBe(true)
  })

  it('最後一步按下一步停在最後一步，不循環', () => {
    expect(nextStep(14, 15)).toBe(14)
    expect(isLastStep(14, 15)).toBe(true)
  })

  it('中間的步驟正常前後移動', () => {
    expect(nextStep(6, 15)).toBe(7)
    expect(prevStep(6, 15)).toBe(5)
    expect(isFirstStep(6)).toBe(false)
    expect(isLastStep(6, 15)).toBe(false)
  })

  it('clampStep 處理超出範圍、小數、NaN 與空清單', () => {
    expect(clampStep(-3, 15)).toBe(0)
    expect(clampStep(99, 15)).toBe(14)
    expect(clampStep(3.7, 15)).toBe(3)
    expect(clampStep(Number.NaN, 15)).toBe(0)
    expect(clampStep(5, 0)).toBe(0)
  })
})

describe('網址上的步驟參數', () => {
  it('1-based 轉 0-based', () => {
    expect(stepFromParam('1', 15)).toBe(0)
    expect(stepFromParam('15', 15)).toBe(14)
  })

  it('無效或超出範圍時回到合理的步驟', () => {
    expect(stepFromParam(undefined, 15)).toBe(0)
    expect(stepFromParam('abc', 15)).toBe(0)
    expect(stepFromParam('2.5', 15)).toBe(0)
    expect(stepFromParam('0', 15)).toBe(0)
    expect(stepFromParam('99', 15)).toBe(14)
  })
})

describe('點插圖上的機器', () => {
  const steps = [{ node: 'a' }, { node: 'b' }, { node: 'a' }, { node: 'c' }, { node: 'a' }]

  it('不在這台機器時跳到它的第一步', () => {
    expect(stepAtNode(steps, 1, 'a')).toBe(0)
    expect(stepAtNode(steps, 0, 'c')).toBe(3)
  })

  it('已經在這台機器時跳到它的下一步，最後一個再回到第一個', () => {
    expect(stepAtNode(steps, 0, 'a')).toBe(2)
    expect(stepAtNode(steps, 2, 'a')).toBe(4)
    expect(stepAtNode(steps, 4, 'a')).toBe(0)
  })

  it('不存在的機器維持目前步驟', () => {
    expect(stepAtNode(steps, 3, 'zzz')).toBe(3)
  })
})
