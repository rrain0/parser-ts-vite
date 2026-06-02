import {
  formatSpacesByType,
  type FormatterSpacesByType,
} from '@/string-parser-v2/formatterSpacesByType.ts'
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




// Create formatter config

const spacesByType: FormatterSpacesByType<T> = {
  'MINUS': { l: 1, r: 1 },
  'PLUS': { l: 1, r: 1 },
  'MULT': { l: 1, r: 1 },
  'DIV': { l: 1, r: 1 },
  'SPACE': { remove: true },
}




// Test calculator formatter

describe('formatterSpacesByType.v2', () => {
  describe('formatter', () => {
    
    
    {
      const input = '4   *(x2^3.14)@@#5))/(10)+'
      test(strInputComment(input), () => {
        const lexemes = tokenize(input, ctxs, rootCtx)
        const formatted = formatSpacesByType(lexemes, spacesByType)
        expect(formatted).toEqual('4 * (x2^3.14)@@#5)) / (10) + ')
      })
    }
    
    
  })
})
