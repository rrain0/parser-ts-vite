


export type TokenType =
  | 'SQRT'
  | 'LPAREN'
  | 'RPAREN'
  | 'PLUS'
  | 'MINUS'
  | 'MULT'
  | 'DIV'
  | 'POW'
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'SPACE'

export type TokenCtxType =
  | ''
  | 'LPAREN'
  

export interface LexemePat {
  type: TokenType
  string?: string | undefined
  pattern?: RegExp | undefined
}
export interface TokenCtx {
  startCtx?: TokenCtxType | undefined // задать контекст токенизации
  endCtx?: TokenCtxType | undefined // завершить контекст токенизации
  inCtx: TokenCtxType[] // токен разрешён в этом контексте
}

export type Token = LexemePat & TokenCtx

export interface Lexeme {
  token: Token
  start: number
  value: string
}

// Типы и паттерны лексем
const sqrtLx: LexemePat = { type: 'SQRT', pattern: /^(sqrt|SQRT)/ }
const lparenLx: LexemePat = { type: 'LPAREN', string: '(' }
const rparenLx: LexemePat = { type: 'RPAREN', string: ')' }
const minusLx: LexemePat = { type: 'MINUS', string: '-' }
const plusLx: LexemePat = { type: 'PLUS', string: '+' }
const multLx: LexemePat = { type: 'MULT', string: '*' }
const divLx: LexemePat = { type: 'DIV', string: '/' }
const powLx: LexemePat = { type: 'POW', string: '^' }
const numberLx: LexemePat = { type: 'NUMBER', pattern: /^\d+([.]\d+)?/ }
const idfLx: LexemePat = { type: 'IDENTIFIER', pattern: /^[a-zA-Z_]+/ }
const spaceLx: LexemePat = { type: 'SPACE', pattern: /^\s+/ }

// Контекст лексем
const defCtx: TokenCtx = { inCtx: ['', 'LPAREN'] }
const lparenCtx: TokenCtx = { ...defCtx, startCtx: 'LPAREN'  }
const rparenCtx: TokenCtx = { inCtx: ['LPAREN'], endCtx: 'LPAREN' }

// Сами токены
export const sqrtTk: Token = { ...sqrtLx, ...defCtx }
export const lParenTk: Token = { ...lparenLx, ...lparenCtx }
export const rparenTk: Token = { ...rparenLx, ...rparenCtx }
export const minusTk: Token = { ...minusLx, ...defCtx }
export const plusTk: Token = { ...plusLx, ...defCtx }
export const multTk: Token = { ...multLx, ...defCtx }
export const divTk: Token = { ...divLx, ...defCtx }
export const powTk: Token = { ...powLx, ...defCtx }
export const numberTk: Token = { ...numberLx, ...defCtx }
export const idfTk: Token = { ...idfLx, ...defCtx }
export const spaceTk: Token = { ...spaceLx, ...defCtx }

// Токены должны быть в правильном порядке.
// Как минимум если токен фиксированная строка, длинные строки идут раньше.
// Регулярки переменной длины обычно идут в конце.
export const finalTokens: Token[] = [
  // 4 символа
  sqrtTk,
  // 1 символ
  lParenTk,
  rparenTk,
  minusTk,
  plusTk,
  multTk,
  divTk,
  powTk,
  // Регулярки переменной длины
  numberTk,
  idfTk,
  spaceTk,
]

export function tokenize(input: string, tokens: Token[] = finalTokens): Lexeme[] {
  const ctxToTokens = new Map<TokenCtxType, Token[]>()
  
  const rootCtx: TokenCtxType = ''
  
  for (const token of tokens) {
    const { inCtx = [''] } = token
    for (let ctx of inCtx) {
      ctx ??= rootCtx
      if (!ctxToTokens.has(ctx)) ctxToTokens.set(ctx, [token])
      else ctxToTokens.get(ctx)!.push(token)
    }
  }
  
  const lexemes: Lexeme[] = []
  const ctxStack: TokenCtxType[] = [rootCtx]
  
  let i = 0
  while (i < input.length) {
    const ctx = ctxStack.at(-1)!
    const availableTokens = ctxToTokens.get(ctx)
    if (availableTokens) {
      
      const lexeme = matchToken(input, i, availableTokens)
      if (lexeme) {
        
        const { type, startCtx, endCtx } = lexeme.token
        if (endCtx) {
          if (ctx !== endCtx) {
            throw new Error(`Token of type ${type} must be in ctx ${ctx}`)
          }
          ctxStack.length = ctxStack.length - 1
        }
        if (startCtx) {
          ctxStack.push(startCtx)
        }
        
        i = lexeme.start + lexeme.value.length
        lexemes.push(lexeme)
        continue
      }
      
      throw new Error(`Неожиданный символ '${input[i]}' на позиции ${i}`)
      throw new Error(
        `No lexeme found at ${i} for ...${input.substring(i, i + 10)}... in ctx ${ctx}`
      )
    }
    
    throw new Error(`No available tokens for ctx: ${ctx}`)
  }
  
  if (JSON.stringify(ctxStack) !== JSON.stringify([''])) {
    throw new Error(`Unclosed ctxs: ${ctxStack.slice(1)}`)
  }
  
  return lexemes
}

function matchToken(input: string, start: number, tokens: Token[]): Lexeme | undefined {
  for (const token of tokens) {
    if (token.string) {
      const value = input.substring(start, start + token.string.length)
      if (token.string === value) return { token, start, value }
    }
    else if (token.pattern) {
      const fromValue = input.substring(start)
      const match = fromValue.match(token.pattern)
      if (match) return { token, start, value: match[0] }
    }
  }
}


export function tokenizerTest() {
  const inputs = [
    'event.type="click"',
    'timestamp>100',
    'value=3.14',
    'a=1.',
    '=', '!=', '>', '<', '>=', '<=',
    'a=1 AND b=2 OR c=3',
    'a=1 and b=2 or c=3',
    '(a=1)',
    'a="hello',
    'a@b',
    '  a  =  1  ',
  ]
  inputs.forEach(it => {
    try {
      console.log('input:', it)
      const lexemes = tokenize(it)
      console.log('lexemes', lexemes.map(({
        token: { type, inCtx },
        start,
        value,
      }) => ({
        type, value, ctx: JSON.stringify(inCtx), start,
      })))
    }
    catch (err) {
      console.error(err)
    }
  })
}
