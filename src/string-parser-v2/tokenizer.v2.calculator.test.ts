import {
  type ContextsOfTokens, type Lexeme,
  type Token,
  tokenize,
} from '@/string-parser-v2/tokenizer.ts'
import { strInputComment } from '@@/utils/test/test.ts'
import { describe, expect, test } from 'vitest'



// Create calculator tokenizer config

export type TokenType =
  | 'MINUS'
  | 'PLUS'
  | 'MULT'
  | 'DIV'
  | 'POW'
  | 'SQRT'
  | 'LPAREN'
  | 'RPAREN'
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'SPACE'
  | 'UNOPENED_RPAREN'
  | 'UNKNOWN'

export type TokenContextType =
  | 'EXPR'
  | 'LPAREN'



type T = TokenType
type Ctx = TokenContextType
type Tk = Token<T, Ctx>
type Ctxs = ContextsOfTokens<T, Ctx>
type Lx = Lexeme<T, Ctx>



// Tokens
const minusTk: Tk = { type: 'MINUS', string: '-' }
const plusTk: Tk = { type: 'PLUS', string: '+' }
const multTk: Tk = { type: 'MULT', string: '*' }
const divTk: Tk = { type: 'DIV', string: '/' }
const powTk: Tk = { type: 'POW', string: '^' }
const sqrtTk: Tk = { type: 'SQRT', string: 'sqrt' }
const lParenTk: Tk = { type: 'LPAREN', string: '(', startCtx: 'LPAREN' }
const rparenTk: Tk = { type: 'RPAREN', string: ')', endCtx: 'LPAREN' }
const numberTk: Tk = { type: 'NUMBER', pattern: /^\d+([.]\d+)?/ }
const idfTk: Tk = { type: 'IDENTIFIER', pattern: /^[a-zA-Z_][0-9a-zA-Z_]*/ }
const spaceTk: Tk = { type: 'SPACE', pattern: /^\s+/ }
const unopenedRparenTk: Tk = { type: 'UNOPENED_RPAREN', string: ')' }
const unknownTk: Tk = {
  type: 'UNKNOWN',
  matcher: (input, i) => ({ i, value: input[i] }),
}

// Contexts of tokens.
// Tokens are checked in ascending order.
// Longer tokens are usually first.
// Variable length regex tokens are usually last.
const lparenTks: Tk[] = [
  // 4 symbols
  sqrtTk,
  
  // 1 symbol
  lParenTk,
  rparenTk,
  minusTk,
  plusTk,
  multTk,
  divTk,
  powTk,
  
  // 1+ symbol
  numberTk,
  idfTk,
  spaceTk,
  
  // unknown input
  unknownTk,
]
const exprTks: Tk[] = lparenTks.map(it => it.type === 'RPAREN' ? unopenedRparenTk : it)

const ctxs: Ctxs = {
  'EXPR': exprTks,
  'LPAREN': lparenTks,
}
const rootCtx: Ctx = 'EXPR'




// Test calculator tokenizer

describe('tokenizer.v2', () => {
  describe('calculator', () => {
    
    
    {
      const input = '(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2'
      test(strInputComment(input), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          
          { token: lParenTk, i: 0, value: '(' },
          { token: numberTk, i: 1, value: '4' },
          { token: spaceTk, i: 2, value: ' ' },
          { token: multTk, i: 3, value: '*' },
          { token: spaceTk, i: 4, value: ' ' },
          
          { token: lParenTk, i: 5, value: '(' },
          { token: idfTk, i: 6, value: 'x' },
          { token: powTk, i: 7, value: '^' },
          { token: numberTk, i: 8, value: '3' },
          { token: spaceTk, i: 9, value: ' ' },
          { token: minusTk, i: 10, value: '-' },
          { token: spaceTk, i: 11, value: ' ' },
          { token: numberTk, i: 12, value: '5' },
          { token: rparenTk, i: 13, value: ')' },
          
          { token: spaceTk, i: 14, value: ' ' },
          { token: divTk, i: 15, value: '/' },
          { token: spaceTk, i: 16, value: ' ' },
          
          { token: lParenTk, i: 17, value: '(' },
          { token: numberTk, i: 18, value: '2' },
          { token: spaceTk, i: 19, value: ' ' },
          { token: multTk, i: 20, value: '*' },
          { token: spaceTk, i: 21, value: ' ' },
          { token: idfTk, i: 22, value: 'y' },
          { token: rparenTk, i: 23, value: ')' },
          
          { token: rparenTk, i: 24, value: ')' },
          
          { token: spaceTk, i: 25, value: ' ' },
          { token: plusTk, i: 26, value: '+' },
          { token: spaceTk, i: 27, value: ' ' },
          { token: sqrtTk, i: 28, value: 'sqrt' },
          
          { token: lParenTk, i: 32, value: '(' },
          { token: numberTk, i: 33, value: '16' },
          { token: spaceTk, i: 35, value: ' ' },
          { token: multTk, i: 36, value: '*' },
          { token: spaceTk, i: 37, value: ' ' },
          { token: idfTk, i: 38, value: 'x' },
          { token: rparenTk, i: 39, value: ')' },
          
          { token: spaceTk, i: 40, value: ' ' },
          { token: minusTk, i: 41, value: '-' },
          { token: spaceTk, i: 42, value: ' ' },
          { token: numberTk, i: 43, value: '3' },
          { token: spaceTk, i: 44, value: ' ' },
          { token: multTk, i: 45, value: '*' },
          { token: spaceTk, i: 46, value: ' ' },
          { token: idfTk, i: 47, value: 'y' },
          { token: powTk, i: 48, value: '^' },
          { token: numberTk, i: 49, value: '2' },
        
        ] satisfies Lx[])
      })
    }
    
    
    {
      const input = '4   *(x2^3.14)@@#5))(10)'
      test(strInputComment(input), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          
          { token: numberTk, i: 0, value: '4' },
          { token: spaceTk, i: 1, value: '   ' },
          { token: multTk, i: 4, value: '*' },
          
          { token: lParenTk, i: 5, value: '(' },
          { token: idfTk, i: 6, value: 'x2' },
          { token: powTk, i: 8, value: '^' },
          { token: numberTk, i: 9, value: '3.14' },
          { token: rparenTk, i: 13, value: ')' },
          
          { token: unknownTk, i: 14, value: '@' },
          { token: unknownTk, i: 15, value: '@' },
          { token: unknownTk, i: 16, value: '#' },
          { token: numberTk, i: 17, value: '5' },
          
          { token: unopenedRparenTk, i: 18, value: ')' },
          { token: unopenedRparenTk, i: 19, value: ')' },
          
          { token: lParenTk, i: 20, value: '(' },
          { token: numberTk, i: 21, value: '10' },
          { token: rparenTk, i: 23, value: ')' },
        
        ] satisfies Lx[])
      })
    }
    
    
  })
})
