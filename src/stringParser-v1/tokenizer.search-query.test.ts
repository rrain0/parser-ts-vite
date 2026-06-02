import {
  type ContextsOfTokens, type Lexeme,
  type Token,
  type TokenContextModifier, tokenize,
  type TokenPattern,
} from '@/stringParser-v1/tokenizer.ts'
import { strInputComment } from '@@/utils/test/test.ts'
import { describe, expect, test } from 'vitest'



// Create search query tokenizer config

export type TokenType =
  | 'OR'
  | 'AND'
  | 'EQ'
  | 'NEQ'
  | 'GT'
  | 'LT'
  | 'GTE'
  | 'LTE'
  | 'DOT'
  | 'LPAREN'
  | 'RPAREN'
  | 'LDQUOTE'
  | 'RDQUOTE'
  | 'NUMBER'
  | 'STRING'
  | 'IDENTIFIER'
  | 'SPACE'

export type TokenContextType =
  | 'EXPR'
  | 'LPAREN'
  | 'LDQUOTE'



type T = TokenType
type Ctx = TokenContextType
type Pat = TokenPattern<T>
type CtxMod = TokenContextModifier<Ctx>
type Tk = Token<T, Ctx>
type Ctxs = ContextsOfTokens<T, Ctx>
type Lx = Lexeme<T, Ctx>



// Type & pattern of token
const orPat: Pat = { type: 'OR', pattern: /^(or|OR)/ }
const andPat: Pat = { type: 'AND', pattern: /^(and|AND)/ }
const eqPat: Pat = { type: 'EQ', string: '=' }
const neqPat: Pat = { type: 'NEQ', string: '!=' }
const gtPat: Pat = { type: 'GT', string: '>' }
const ltPat: Pat = { type: 'LT', string: '<' }
const gtePat: Pat = { type: 'GTE', string: '>=' }
const ltePat: Pat = { type: 'LTE', string: '<=' }
const dotPat: Pat = { type: 'DOT', string: '.' }
const lparenPat: Pat = { type: 'LPAREN', string: '(' }
const rparenPat: Pat = { type: 'RPAREN', string: ')' }
const ldquotePat: Pat = { type: 'LDQUOTE', string: '"' }
const rdquotePat: Pat = { type: 'RDQUOTE', string: '"' }
const numberPat: Pat = { type: 'NUMBER', pattern: /^\d+([.]\d+)?/ }
const stringPat: Pat = { type: 'STRING', pattern: /^[^"]*/ }
const idfPat: Pat = { type: 'IDENTIFIER', pattern: /^[a-zA-Z_]+/ }
const spacePat: Pat = { type: 'SPACE', pattern: /^\s+/ }

// Context of token
const lparenCtxMod: CtxMod = { startCtx: 'LPAREN' }
const rparenCtxMod: CtxMod = { endCtx: 'LPAREN' }
const ldquoteCtxMod: CtxMod = { startCtx: 'LDQUOTE' }
const rdquoteCtxMod: CtxMod = { endCtx: 'LDQUOTE' }

// Tokens
const orTk: Tk = { ...orPat }
const andTk: Tk = { ...andPat }
const eqTk: Tk = { ...eqPat }
const neqTk: Tk = { ...neqPat }
const gtTk: Tk = { ...gtPat }
const ltTk: Tk = { ...ltPat }
const gteTk: Tk = { ...gtePat }
const lteTk: Tk = { ...ltePat }
const dotTk: Tk = { ...dotPat }
const lParenTk: Tk = { ...lparenPat, ...lparenCtxMod }
const rparenTk: Tk = { ...rparenPat, ...rparenCtxMod }
const ldquoteTk: Tk = { ...ldquotePat, ...ldquoteCtxMod }
const rdquoteTk: Tk = { ...rdquotePat, ...rdquoteCtxMod }
const numberTk: Tk = { ...numberPat }
const stringTk: Tk = { ...stringPat }
const idfTk: Tk = { ...idfPat }
const spaceTk: Tk = { ...spacePat }

// Contexts of tokens.
// Tokens are checked in ascending order.
// Longer tokens are usually first.
// Variable length regex tokens are usually last.
const lparenTks: Tk[] = [
  // 3 symbols
  andTk,
  
  // 2 symbols
  orTk,
  neqTk,
  gteTk,
  lteTk,
  
  // 1 symbol
  eqTk,
  gtTk,
  ltTk,
  dotTk,
  lParenTk,
  rparenTk,
  ldquoteTk,
  //rdquoteTk, // available in 'LDQUOTE' context
  
  // 1+ symbol
  numberTk,
  //stringTk, // available in 'LDQUOTE' context
  idfTk,
  spaceTk,
]
const ldquoteTks: Tk[] = [
  // 1 symbol
  rdquoteTk,
  
  // 1+ symbol
  stringTk,
]
// 'RPAREN' is not allowed when no 'LPAREN'
const exprTks: Tk[] = lparenTks.filter(it => it.type !== 'RPAREN')

const ctxs: Ctxs = {
  'EXPR': exprTks,
  'LPAREN': lparenTks,
  'LDQUOTE': ldquoteTks,
}
const rootCtx: Ctx = 'EXPR'




// Test calculator tokenizer

describe('tokenizer', () => {
  describe('search-query', () => {
    {
      const input = 'event.type="click"'
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'event' },
          { token: dotTk, start: 5, value: '.' },
          { token: idfTk, start: 6, value: 'type' },
          { token: eqTk, start: 10, value: '=' },
          { token: ldquoteTk, start: 11, value: '"' },
          { token: stringTk, start: 12, value: 'click' },
          { token: rdquoteTk, start: 17, value: '"' },
        ])
      })
    }
    
    
    {
      const input = 'timestamp>100'
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'timestamp' },
          { token: gtTk, start: 9, value: '>' },
          { token: numberTk, start: 10, value: '100' },
        ])
      })
    }
    
    
    {
      const comment = 'tokenize fractional numbers'
      const input = 'value=3.14'
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'value' },
          { token: eqTk, start: 5, value: '=' },
          { token: numberTk, start: 6, value: '3.14' },
        ])
      })
    }
    
    
    {
      const comment = 'does not consume dot when no numbers after it'
      const input = 'a=1.'
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'a' },
          { token: eqTk, start: 1, value: '=' },
          { token: numberTk, start: 2, value: '1' },
          { token: dotTk, start: 3, value: '.' },
        ])
      })
    }
    
    
    {
      const input = '='
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: eqTk, start: 0, value: '=' },
        ])
      })
    }
    
    
    {
      const input = '!='
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: neqTk, start: 0, value: '!=' },
        ])
      })
    }
    
    
    {
      const input = '>'
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: gtTk, start: 0, value: '>' },
        ])
      })
    }
    
    
    {
      const input = '<'
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: ltTk, start: 0, value: '<' },
        ])
      })
    }
    
    
    {
      const input = '>='
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: gteTk, start: 0, value: '>=' },
        ])
      })
    }
    
    
    {
      const input = '<='
      test(input, () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: lteTk, start: 0, value: '<=' },
        ])
      })
    }
    
    
    {
      const comment = 'uppercase ops'
      const input = 'a=1 AND b=2 OR c=3'
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'a' },
          { token: eqTk, start: 1, value: '=' },
          { token: numberTk, start: 2, value: '1' },
          { token: spaceTk, start: 3, value: ' ' },
          { token: andTk, start: 4, value: 'AND' },
          { token: spaceTk, start: 7, value: ' ' },
          { token: idfTk, start: 8, value: 'b' },
          { token: eqTk, start: 9, value: '=' },
          { token: numberTk, start: 10, value: '2' },
          { token: spaceTk, start: 11, value: ' ' },
          { token: orTk, start: 12, value: 'OR' },
          { token: spaceTk, start: 14, value: ' ' },
          { token: idfTk, start: 15, value: 'c' },
          { token: eqTk, start: 16, value: '=' },
          { token: numberTk, start: 17, value: '3' },
        ])
      })
    }
    
    
    {
      const comment = 'lowercase ops'
      const input = 'a=1 and b=2 or c=3'
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: idfTk, start: 0, value: 'a' },
          { token: eqTk, start: 1, value: '=' },
          { token: numberTk, start: 2, value: '1' },
          { token: spaceTk, start: 3, value: ' ' },
          { token: andTk, start: 4, value: 'and' },
          { token: spaceTk, start: 7, value: ' ' },
          { token: idfTk, start: 8, value: 'b' },
          { token: eqTk, start: 9, value: '=' },
          { token: numberTk, start: 10, value: '2' },
          { token: spaceTk, start: 11, value: ' ' },
          { token: orTk, start: 12, value: 'or' },
          { token: spaceTk, start: 14, value: ' ' },
          { token: idfTk, start: 15, value: 'c' },
          { token: eqTk, start: 16, value: '=' },
          { token: numberTk, start: 17, value: '3' },
        ])
      })
    }
    
    
    {
      const comment = 'tokenize parentheses'
      const input = '(a=1)'
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: lParenTk, start: 0, value: '(' },
          { token: idfTk, start: 1, value: 'a' },
          { token: eqTk, start: 2, value: '=' },
          { token: numberTk, start: 3, value: '1' },
          { token: rparenTk, start: 4, value: ')' },
        ])
      })
    }
    
    
    {
      const comment = 'unclosed string error'
      const input = 'a="hello'
      test(strInputComment(input, comment), () => {
        expect(() => tokenize(input, ctxs, rootCtx))
          .toThrow(`Unclosed contexts: ["LDQUOTE"]`)
      })
    }
    
    
    {
      const comment = 'unexpected character error'
      const input = 'a@b'
      test(strInputComment(input, comment), () => {
        expect(() => tokenize(input, ctxs, rootCtx))
          .toThrow(`No lexeme found at 1 for '@b'... in context 'EXPR'`)
      })
    }
    
    
    {
      const comment = 'skips spaces'
      const input = '  a  =  1  '
      test(strInputComment(input, comment), () => {
        expect(tokenize(input, ctxs, rootCtx)).toEqual([
          { token: spaceTk, start: 0, value: '  ' },
          { token: idfTk, start: 2, value: 'a' },
          { token: spaceTk, start: 3, value: '  ' },
          { token: eqTk, start: 5, value: '=' },
          { token: spaceTk, start: 6, value: '  ' },
          { token: numberTk, start: 8, value: '1' },
          { token: spaceTk, start: 9, value: '  ' },
        ])
      })
    }
    
    
  })
})
