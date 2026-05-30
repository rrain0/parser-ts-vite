import { evaluate } from './evaluator.ts'
import { parse } from './parser.ts'
import { tokenize } from './tokenizer.ts'
import { describe, expect, test } from 'vitest'



const clickEvent = {
  id: '1',
  timestamp: 1000,
  nodeName: 'Button',
  event: { type: 'click', additionalInfo: { sum: 500 } },
  parent: { nodeName: 'Sidebar', parent: { nodeName: 'MainPage', parent: null } },
}

const mountEvent = {
  id: '2',
  timestamp: 2000,
  nodeName: 'Modal',
  event: { type: 'mount' },
  parent: null,
}



describe('evaluator', () => {
  
  test('null AST совпадает со всеми событиями', () => {
    const ast = parse(tokenize(''))
    expect(evaluate(ast, clickEvent)).toEqual(true)
    expect(evaluate(ast, mountEvent)).toEqual(true)
  })
  
  test('сравнение строк — совпадение', () => {
    const ast = parse(tokenize('event.type="click"'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
  })
  test('сравнение строк — несовпадение', () => {
    const ast = parse(tokenize('event.type="click"'))
    expect(evaluate(ast, mountEvent)).toEqual(false)
  })
  
  test('сравнение с полем верхнего уровня', () => {
    const ast = parse(tokenize('nodeName="Button"'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
    expect(evaluate(ast, mountEvent)).toEqual(false)
  })
  
  test('оператор неравенства', () => {
    const ast = parse(tokenize('event.type!="click"'))
    expect(evaluate(ast, clickEvent)).toEqual(false)
    expect(evaluate(ast, mountEvent)).toEqual(true)
  })
  
  test('числовое сравнение — больше', () => {
    const ast = parse(tokenize('timestamp>1500'))
    expect(evaluate(ast, clickEvent)).toEqual(false)
    expect(evaluate(ast, mountEvent)).toEqual(true)
  })
  
  test('числовое сравнение — меньше или равно', () => {
    const ast = parse(tokenize('timestamp<=1000'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
    expect(evaluate(ast, mountEvent)).toEqual(false)
  })
  
  test('вложенное поле — parent.nodeName', () => {
    const ast = parse(tokenize('parent.nodeName="Sidebar"'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
    expect(evaluate(ast, mountEvent)).toEqual(false)
  })
  
  test('null parent — неравенство возвращает true', () => {
    const ast = parse(tokenize('parent.nodeName!="something"'))
    expect(evaluate(ast, mountEvent)).toEqual(true)
  })
  
  test('null parent — равенство возвращает false', () => {
    const ast = parse(tokenize('parent.nodeName="something"'))
    expect(evaluate(ast, mountEvent)).toEqual(false)
  })
  
  test('AND — оба условия true', () => {
    const ast = parse(tokenize('event.type="click" AND nodeName="Button"'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
  })
  
  test('AND — одно условие false', () => {
    const ast = parse(tokenize('event.type="click" AND nodeName="Modal"'))
    expect(evaluate(ast, clickEvent)).toEqual(false)
  })
  
  test('вложенное additionalInfo', () => {
    const ast = parse(tokenize('event.additionalInfo.sum=500'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
  })
  
  test('числовое сравнение вложенного поля', () => {
    const ast = parse(tokenize('event.additionalInfo.sum>=500'))
    expect(evaluate(ast, clickEvent)).toEqual(true)
  })
  
})
