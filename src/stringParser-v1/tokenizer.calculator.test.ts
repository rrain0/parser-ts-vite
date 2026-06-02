import {
  type ContextsOfTokens, type Lexeme,
  type Token,
  type TokenContextModifier, tokenize,
  type TokenPattern,
} from '@/stringParser-v1/tokenizer.ts'
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

export type TokenContextType =
  | 'EXPR'
  | 'LPAREN'



type T = TokenType
type Ctx = TokenContextType
type Pat = TokenPattern<T>
type CtxMod = TokenContextModifier<Ctx>
type Tk = Token<T, Ctx>
type Ctxs = ContextsOfTokens<T, Ctx>
type Lx = Lexeme<T, Ctx>



// Type & pattern of token
const minusPat: Pat = { type: 'MINUS', string: '-' }
const plusPat: Pat = { type: 'PLUS', string: '+' }
const multPat: Pat = { type: 'MULT', string: '*' }
const divPat: Pat = { type: 'DIV', string: '/' }
const powPat: Pat = { type: 'POW', string: '^' }
const sqrtPat: Pat = { type: 'SQRT', string: 'sqrt' }
const lparenPat: Pat = { type: 'LPAREN', string: '(' }
const rparenPat: Pat = { type: 'RPAREN', string: ')' }
const numberPat: Pat = { type: 'NUMBER', pattern: /^\d+([.]\d+)?/ }
const idfPat: Pat = { type: 'IDENTIFIER', pattern: /^[a-zA-Z_]+/ }
const spacePat: Pat = { type: 'SPACE', pattern: /^\s+/ }

// Context of token
const lparenCtxMod: CtxMod = { startCtx: 'LPAREN' }
const rparenCtxMod: CtxMod = { endCtx: 'LPAREN' }

// Tokens
const sqrtTk: Tk = { ...sqrtPat }
const lParenTk: Tk = { ...lparenPat, ...lparenCtxMod }
const rparenTk: Tk = { ...rparenPat, ...rparenCtxMod }
const minusTk: Tk = { ...minusPat }
const plusTk: Tk = { ...plusPat }
const multTk: Tk = { ...multPat }
const divTk: Tk = { ...divPat }
const powTk: Tk = { ...powPat }
const numberTk: Tk = { ...numberPat }
const idfTk: Tk = { ...idfPat }
const spaceTk: Tk = { ...spacePat }

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
]
// 'RPAREN' is not allowed when no 'LPAREN'
const exprTks: Tk[] = lparenTks.filter(it => it.type !== 'RPAREN')

const ctxs: Ctxs = {
  'EXPR': exprTks,
  'LPAREN': lparenTks,
}
const rootCtx: Ctx = 'EXPR'




// Test calculator tokenizer

describe('tokenizer', () => {
  describe('calculator', () => {
    
    
    {
      const input = '(4 * (x^3 - 5) / (2 * y)) + sqrt(16 * x) - 3 * y^2'
      test(strInputComment(input), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          
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
    }
    
  })
})

