import { parse } from './parser.ts'
import { tokenize } from './tokenizer.ts'
import { describe, expect, test } from 'vitest'

describe('tokenizer', () => {
  
  test('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2', () => {
    const lexemes = tokenize('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2')
    const astTree = parse(lexemes)
    // TODO
    expect(astTree).toEqual(undefined)
  })
  
})
