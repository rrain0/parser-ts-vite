import {
  andTk,
  dotTk,
  eqTk,
  gteTk, gtTk,
  idfTk,
  ldquoteTk,
  lParenTk, lteTk,
  ltTk,
  neqTk,
  numberTk,
  orTk,
  rdquoteTk,
  rparenTk,
  spaceTk,
  stringTk,
  tokenize,
} from './tokenizer.ts'
import { describe, expect, test } from 'vitest'

describe('tokenizer', () => {
  test('event.type="click"', () => {
    expect(tokenize('event.type="click"')).toEqual([
      { token: idfTk, start: 0, value: 'event' },
      { token: dotTk, start: 5, value: '.' },
      { token: idfTk, start: 6, value: 'type' },
      { token: eqTk, start: 10, value: '=' },
      { token: ldquoteTk, start: 11, value: '"' },
      { token: stringTk, start: 12, value: 'click' },
      { token: rdquoteTk, start: 17, value: '"' },
    ])
  })
  
  test('timestamp>100', () => {
    expect(tokenize('timestamp>100')).toEqual([
      { token: idfTk, start: 0, value: 'timestamp' },
      { token: gtTk, start: 9, value: '>' },
      { token: numberTk, start: 10, value: '100' },
    ])
  })
  
  test('value=3.14', () => {
    expect(tokenize('value=3.14')).toEqual([
      { token: idfTk, start: 0, value: 'value' },
      { token: eqTk, start: 5, value: '=' },
      { token: numberTk, start: 6, value: '3.14' },
    ])
  })
  
  test('a=1.', () => {
    expect(tokenize('a=1.')).toEqual([
      { token: idfTk, start: 0, value: 'a' },
      { token: eqTk, start: 1, value: '=' },
      { token: numberTk, start: 2, value: '1' },
      { token: dotTk, start: 3, value: '.' },
    ])
  })
  
  test('=', () => expect(tokenize('=')).toEqual([{ token: eqTk, start: 0, value: '=' }]))
  test('!=', () => {
    expect(tokenize('!=')).toEqual([{ token: neqTk, start: 0, value: '!=' }])
  })
  test('>', () => expect(tokenize('>')).toEqual([{ token: gtTk, start: 0, value: '>' }]))
  test('<', () => expect(tokenize('<')).toEqual([{ token: ltTk, start: 0, value: '<' }]))
  test('>=', () => expect(tokenize('>=')).toEqual([{ token: gteTk, start: 0, value: '>=' }]))
  test('<=', () => expect(tokenize('<=')).toEqual([{ token: lteTk, start: 0, value: '<=' }]))
  
  test('a=1 AND b=2 OR c=3', () => {
    expect(tokenize('a=1 AND b=2 OR c=3')).toEqual([
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
  
  test('a=1 and b=2 or c=3 (lowercase ops)', () => {
    expect(tokenize('a=1 and b=2 or c=3')).toEqual([
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
  
  test('(a=1)', () => {
    expect(tokenize('(a=1)')).toEqual([
      { token: lParenTk, start: 0, value: '(' },
      { token: idfTk, start: 1, value: 'a' },
      { token: eqTk, start: 2, value: '=' },
      { token: numberTk, start: 3, value: '1' },
      { token: rparenTk, start: 4, value: ')' },
    ])
  })
  
  test('unclosed string error', () => {
    expect(() => tokenize('a="hello')).toThrow(/Незакрытая строка/)
  })
  
  test('unexpected character error', () => {
    expect(() => tokenize('a@b')).toThrow(/Неожиданный символ '@'/)
  })
  
  test('  a  =  1  ', () => {
    expect(tokenize('  a  =  1  ')).toEqual([
      { token: spaceTk, start: 0, value: '  ' },
      { token: idfTk, start: 2, value: 'a' },
      { token: spaceTk, start: 3, value: '  ' },
      { token: eqTk, start: 5, value: '=' },
      { token: spaceTk, start: 6, value: '  ' },
      { token: numberTk, start: 8, value: '1' },
      { token: spaceTk, start: 9, value: '  ' },
    ])
  })
})
