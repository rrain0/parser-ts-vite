import { evaluate } from './evaluator.ts'
import { parse } from './parser.ts'
import { tokenize } from './tokenizer.ts'
import { describe, expect, test } from 'vitest'



describe('evaluator', () => {
  
  const vars = { x: 4, y: 3 }
  
  test('((x^3 - 5)), { x: 2, y: 3 }', () => {
    const lexemes = tokenize('((x^3 - 5))')
    const ast = parse(lexemes)
    const expectedResult =
      ((Math.pow(vars.x, 3) - 5))
    expect(evaluate(ast, vars)).toEqual(expectedResult)
  })
  
  test('(4 * (x^3 - 5)), { x: 2, y: 3 }', () => {
    const lexemes = tokenize('(4 * (x^3 - 5))')
    const ast = parse(lexemes)
    const expectedResult =
      (4 * (Math.pow(vars.x, 3) - 5))
    expect(evaluate(ast, vars)).toEqual(expectedResult)
  })
  
  test('(4 * (x^3 - 5) / (2 * y)), { x: 2, y: 3 }', () => {
    const lexemes = tokenize('(4 * (x^3 - 5) / (2 * y))')
    const ast = parse(lexemes)
    const expectedResult =
      (4 * (Math.pow(vars.x, 3) - 5) / (2 * vars.y))
    expect(evaluate(ast, vars)).toEqual(expectedResult)
  })
  
  test('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2, { x: 2, y: 3 }', () => {
    const vars = { x: 4, y: 3 }
    const lexemes = tokenize('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2')
    const ast = parse(lexemes)
    const expectedResult =
      (4 * (Math.pow(vars.x, 3) - 5) / (2 * vars.y)) +
      Math.sqrt(16 * vars.x) - 3 * Math.pow(vars.y, 2)
    expect(evaluate(ast, vars)).toEqual(expectedResult)
  })
  
})
