import { Calculator } from '@/main.ts'
import { describe, expect, test } from 'vitest'



describe('main', () => {
  test('Calculator.add', () => {
    expect(new Calculator().add(1, 6)).toEqual(7)
  })
})
