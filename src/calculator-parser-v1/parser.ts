import { type Lexeme, tokenize, type TokenType } from './tokenizer.ts'



// 1) Требуемые аргументы на позициях справа и слева -
// если ноды требуют друг друга в качестве аргументов, то это синтаксическая ошибка ввода
// 2) Контекст - требуется там,
// где есть явный оператор открытия и явный оператор закрытия: () ""
// 3) Приоритет - работает внутри контекста,
// когда 2 оператора хотят одно значение в качестве аргумента: ... or value and ...
// 4) Тип ноды аргумента - оператор может иметь ограничкения по результирующему типу ноды.



export type NodeArgType =
  | 'value' // самостоятельно вычисляемое значение
  | 'idf' // указатель на значение извне

export type NodeForType =
  | 'consumer' // проверяемая нода для текущей ноды является аргументом
  | NodeArgType

export interface NodeInTree {
  forNearL: NodeForType // чем является нода для ноды, которая физически в строке справа
  forNearR: NodeForType // чем является нода для ноды, которая физически в строке слева
  forLPrec: number // приоритет для ноды слева
  forRPrec: number // приоритет для ноды справа
  needL?: NodeArgType[] | undefined // что нужно ноде в качестве аргумента справа
  needR?: NodeArgType[] | undefined // что нужно ноде в качестве аргумента слева
}



export type NodeCtxType =
  | ''
  | 'LPAREN'

export interface NodeInCtx { inCtx: NodeCtxType[] }

export interface NodeDefineCtx {
  startCtx?: NodeCtxType | undefined
  endCtx?: NodeCtxType | undefined
}

export type NodeCtx = NodeInCtx & NodeDefineCtx



export type NodeOpType =
  | 'plus'
  | 'minus'
  | 'mult'
  | 'div'
  | 'pow'
  | 'sqrt'
  | 'lparen'
  | 'rparen'
  | 'expression'
  // Values
  | 'number'
  | 'space'
  // Variable or field name
  | 'idf'

export interface NodeOp { type: NodeOpType }



export type Node = NodeInTree & NodeCtx & NodeOp



// Node tree params
const exprInT: NodeInTree = {
  forNearL: 'value', forNearR: 'value',
  forLPrec: 0, forRPrec: 0,
  needR: ['value', 'idf'],
}
const lparenInT: NodeInTree = {
  forNearL: 'value', forNearR: 'consumer',
  forLPrec: 6, forRPrec: 1,
  needR: ['value', 'idf'],
}
const rparenInT: NodeInTree = {
  forNearL: 'consumer', forNearR: 'value',
  forLPrec: 1, forRPrec: 6,
  needL: ['value', 'idf'],
}
const plusInT: NodeInTree = {
  forNearL: 'consumer', forNearR: 'consumer',
  forLPrec: 2, forRPrec: 2,
  needL: ['value', 'idf'], needR: ['value', 'idf'],
}
const multInT: NodeInTree = {
  forNearL: 'consumer', forNearR: 'consumer',
  forLPrec: 3, forRPrec: 3,
  needL: ['value', 'idf'], needR: ['value', 'idf'],
}
const powInT: NodeInTree = {
  forNearL: 'consumer', forNearR: 'consumer',
  forLPrec: 4, forRPrec: 4,
  needL: ['value', 'idf'], needR: ['value', 'idf'],
}
const sqrtInT: NodeInTree = {
  forNearL: 'value', forNearR: 'consumer',
  forLPrec: 6, forRPrec: 5,
  needR: ['value', 'idf'],
}
const valInT: NodeInTree = {
  forNearL: 'value', forNearR: 'value',
  forLPrec: 6, forRPrec: 6,
}
const idfInT: NodeInTree = {
  forNearL: 'idf', forNearR: 'idf',
  forLPrec: 6, forRPrec: 6,
}



// Contexts
const defCtx: NodeCtx = { inCtx: ['', 'LPAREN'] }
const exprCtx: NodeCtx = { ...defCtx, startCtx: '' }
const lparenCtx: NodeCtx = { ...defCtx, startCtx: 'LPAREN'  }
const rparenCtx: NodeCtx = { inCtx: ['LPAREN'], endCtx: 'LPAREN' }



export const plusNode: Node = { type: 'plus', ...plusInT, ...defCtx }
export const minusNode: Node = { type: 'minus', ...plusInT, ...defCtx }
export const multNode: Node = { type: 'mult', ...multInT, ...defCtx }
export const divNode: Node = { type: 'div', ...multInT, ...defCtx }
export const powNode: Node = { type: 'pow', ...powInT, ...defCtx }
export const sqrtNode: Node = { type: 'sqrt', ...sqrtInT, ...defCtx }
export const lparenNode: Node = { type: 'lparen', ...lparenInT, ...lparenCtx }
export const rparenNode: Node = { type: 'rparen', ...rparenInT, ...rparenCtx }
export const idfNode: Node = { type: 'idf', ...idfInT, ...defCtx }
export const numberNode: Node = { type: 'number', ...valInT, ...defCtx }
export const spaceNode: Node = { type: 'space', ...valInT, ...defCtx }
export const expressionNode: Node = { type: 'expression', ...exprInT, ...exprCtx }

// Маппинг токена в ноду
export const tokenTypeToNode: Record<TokenType, Node[]> = {
  PLUS: [plusNode],
  MINUS: [minusNode],
  MULT: [multNode],
  DIV: [divNode],
  POW: [powNode],
  SQRT: [sqrtNode],
  LPAREN: [lparenNode],
  RPAREN: [rparenNode],
  NUMBER: [numberNode],
  IDENTIFIER: [idfNode],
  SPACE: [spaceNode],
}



export interface AstNode {
  node: Node
  up?: AstNode | undefined
  nodeL?: AstNode | undefined // нода - левый аргумент
  nodeR?: AstNode | undefined // нода - правый аргумент
  value?: any | undefined
}



export function parse(lexemes: Lexeme[]): AstNode {
  const root: AstNode = { node: expressionNode }
  const ctxStack: AstNode[] = [root]
  
  let prev: AstNode = root
  
  for (let i = 0; i < lexemes.length; i++) {
    const lexeme = lexemes[i]
    const { token } = lexeme
    
    const currs = tokenTypeToNode[token.type]
    if (!currs?.length) {
      throw new Error(`No nodes for token type [${token.type}]`)
    }
    const ctxAstNode = ctxStack.at(-1)!
    const ctx = ctxAstNode.node.startCtx!
    const currNode = currs.find(it => it.inCtx.includes(ctx))
    if (!currNode) {
      throw new Error(
        `No nodes for ctx [${ctx}] and token type [${token.type}]. ` + 
        `Expected nodes are [${JSON.stringify(currs)}]`
      )
    }
    
    // Пробелы скипаем
    if (currNode.type === 'space') {
      continue
    }
    
    const curr: AstNode = { node: currNode }
    
    // Если нашли конец контекста то закрываем его
    if (currNode.endCtx) {
      if (ctx !== currNode.endCtx) {
        throw new Error(
          `Trying close context [${currNode.endCtx}] but current context is [${ctx}]`
        )
      }
      const ctxUp = ctxAstNode.up
      if (!ctxUp) {
        throw new Error(
          `Unreachable. Context-start node [${JSON.stringify(ctxAstNode)}] must have up node`
        )
      }
      // Здесь получется например, что кто-то справа содержит ноду ')' - закрыватель контекста,
      // которая слева содержит ноду '(' - открыватель контекста,
      // которая справа содержит поддерево контекста.
      insertUpRToCurrL(curr, ctxUp)
      ctxStack.length = ctxStack.length - 1
      prev = curr
      continue
    }
    
    
    
    // Если нашли начало контекста, то добавляем его
    if (curr.node.startCtx) {
      ctxStack.push(curr)
    }
    
    
    // Для нод-значений берём и преобразуем значения
    if (currNode.type === 'number') curr.value = +lexeme.value
    if (currNode.type === 'idf') curr.value = lexeme.value
    
    
    //console.log('prev', prev)
    //console.log('curr', curr)
    
    
    // Пытаемся присвоить левой ноде текущую правую
    const { node: { needR: prevNeedR } } = prev
    const { node: { forNearL: currForNearL } } = curr
    if (prevNeedR?.length) {
      // Если левой ноде нужна правая, но не подоходит по типу, то кидаем ошибку
      if (!prevNeedR.includes(currForNearL as NodeArgType)) {
        throw new Error(
          `Node of type [${prev.node.type}] ` +
          `expects right arg of [${JSON.stringify(prevNeedR)}], ` +
          `but found node [${JSON.stringify(curr.node)}]`
        )
      }
      // Иначе присваиваем левой ноде правую
      attachCurrToUpEmptyR(curr, prev)
      prev = curr
      continue
    }
    
    // Проверяем, что текущей правой ноде нужна левая
    const { node: { forNearR: prevForNearR } } = prev
    const { node: { needL: currNeedL } } = curr
    // Если текущей ноды не нужны аргументы слева, то кидаем ошибку.
    // Потому что мы уже провирили ранее, что левой ноде тоже не нужны аргументы справа.
    // А смежные ноды не могут не быть связаны друг с другом.
    if (!currNeedL?.length) {
      throw new Error(
        `Expected node to be operation with at least left arg, ` + 
        `but is [${JSON.stringify(curr.node)}]`
      )
    }
    // Если левая нода как аргумент не подходит правой по типу, то кидаем ошибку.
    if (!currNeedL.includes(prevForNearR as NodeArgType)) {
      throw new Error(
        `Node of type [${curr.node.type}] ` +
        `expects left arg of [${JSON.stringify(currNeedL)}], ` +
        `but found node [${JSON.stringify(prev.node)}]`
      )
    }
    
    // Теперь левая нода принимается правой нодой как аргумент.
    // Но левая нода может уже быть занята другой операцией,
    // так что идём проверять приоритеты операций.
    // Здесь не сможет быть такого чтобы нода над левой нодой не имела правого аргумента.
    let upLeft = prev.up
    while (true) {
      if (!upLeft) {
        throw new Error(
          `Unreachable. Up node must be present for [${JSON.stringify(prev)}]`
        )
      }
      // Если у текущей левой ноды приоритет меньше, то идёт выше по дереву.
      if (upLeft.node.forRPrec > curr.node.forLPrec) upLeft = upLeft.up
      // Иначе вклиниваем текущую правую ноду
      else {
        insertUpRToCurrL(curr, upLeft)
        prev = curr
        break
      }
    }
    
  }
  
  
  
  // Просто рут может быть и без нод
  if (prev === root) return root
  
  // Последняя нода должна быть закрыта аргументами
  if (prev.node.needR?.length && !prev.nodeR) {
    throw new Error(
      `Expected next node of type [${JSON.stringify(prev.node.needR)}] ` +
      `but there is no more input`
    )
  }
  
  // Все контексты, кроме root должны быть закрыты
  if (ctxStack.length >= 2) {
    throw new Error(
      `Unclosed contexts [${JSON.stringify(ctxStack.slice(1))}]`
    )
  }
  
  return root
}



function attachCurrToUpEmptyR(curr: AstNode, upWithEmptyR: AstNode) {
  if (upWithEmptyR.nodeR) {
    throw new Error(
      `Trying to attach to not empty nodeR in [${upWithEmptyR}`
    )
  }
  upWithEmptyR.nodeR = curr
  curr.up = upWithEmptyR
}

function insertUpRToCurrL(curr: AstNode, up: AstNode) {
  if (!up.nodeR) return attachCurrToUpEmptyR(curr, up)
  
  curr.nodeL = up.nodeR
  curr.nodeL.up = curr
  
  up.nodeR = curr
  curr.up = up
}
