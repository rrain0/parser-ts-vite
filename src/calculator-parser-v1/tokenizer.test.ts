import {
  sqrtTk,
  minusTk,
  multTk,
  lParenTk,
  divTk,
  numberTk,
  idfTk,
  rparenTk,
  spaceTk,
  tokenize, powTk, plusTk,
} from './tokenizer.ts'
import { describe, expect, test } from 'vitest'



describe('tokenizer', () => {
  
  test('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2', () => {
    expect(tokenize('(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2')).toEqual([
      
      { token: lParenTk, start: 0, value: '(' },
      { token: numberTk, start: 1, value: '4' },
      { token: spaceTk, start: 2, value: ' ' },
      { token: multTk, start: 3, value: '*' },
      { token: spaceTk, start: 4, value: ' ' },
      
      { token: lParenTk, start: 5, value: '(' },
      { token: idfTk, start: 6, value: 'x' },
      { token: powTk, start: 7, value: '^' },
      { token: numberTk, start: 8, value: '3' },
      { token: spaceTk, start: 9, value: ' ' },
      { token: minusTk, start: 10, value: '-' },
      { token: spaceTk, start: 11, value: ' ' },
      { token: numberTk, start: 12, value: '5' },
      { token: rparenTk, start: 13, value: ')' },
      
      { token: spaceTk, start: 14, value: ' ' },
      { token: divTk, start: 15, value: '/' },
      { token: spaceTk, start: 16, value: ' ' },
      
      { token: lParenTk, start: 17, value: '(' },
      { token: numberTk, start: 18, value: '2' },
      { token: spaceTk, start: 19, value: ' ' },
      { token: multTk, start: 20, value: '*' },
      { token: spaceTk, start: 21, value: ' ' },
      { token: idfTk, start: 22, value: 'y' },
      { token: rparenTk, start: 23, value: ')' },
      
      { token: rparenTk, start: 24, value: ')' },
      
      { token: spaceTk, start: 25, value: ' ' },
      { token: plusTk, start: 26, value: '+' },
      { token: spaceTk, start: 27, value: ' ' },
      { token: sqrtTk, start: 28, value: 'sqrt' },
      
      { token: lParenTk, start: 32, value: '(' },
      { token: numberTk, start: 33, value: '16' },
      { token: spaceTk, start: 35, value: ' ' },
      { token: multTk, start: 36, value: '*' },
      { token: spaceTk, start: 37, value: ' ' },
      { token: idfTk, start: 38, value: 'x' },
      { token: rparenTk, start: 39, value: ')' },
      
      { token: spaceTk, start: 40, value: ' ' },
      { token: minusTk, start: 41, value: '-' },
      { token: spaceTk, start: 42, value: ' ' },
      { token: numberTk, start: 43, value: '3' },
      { token: spaceTk, start: 44, value: ' ' },
      { token: multTk, start: 45, value: '*' },
      { token: spaceTk, start: 46, value: ' ' },
      { token: idfTk, start: 47, value: 'y' },
      { token: powTk, start: 48, value: '^' },
      { token: numberTk, start: 49, value: '2' },
      
    ])
  })
  
})
