import { arrDropLast } from '@@/utils/array/arrDropLast.ts'
import { eqJson } from '@@/utils/js/eq.ts'
import { notundef } from '@@/utils/ts/tsIs.ts'



// TODO v3:
//   If input changes, then calculate which single part of string was changed
//   (compare chars from start to first different & from end to first different),
//   then invalidate tokens at diff
//   then search from first invalidated place until end of string
//   OR store contextStack & tokens and search until retained contextStack & token are equal
//   OR maybe it is enough to store current (context & token)[]



export interface TokenPattern<TokenType extends string> {
  type: TokenType
  string?: string | undefined
  pattern?: RegExp | undefined
  matcher?: TokenMatcher | undefined
}

export type TokenMatcher = (input: string, i: number) => TokenMatch | undefined

export type TokenMatch = { i: number, value: string }

export interface TokenContextModifier<TokenContextType extends string> {
  // Token starts new context
  startCtx?: TokenContextType | undefined
  // Token ends current context
  endCtx?: TokenContextType | undefined
}

export type Token<TokenType extends string, TokenContextType extends string> =
  TokenPattern<TokenType> & TokenContextModifier<TokenContextType>

export type ContextsOfTokens<
  TokenType extends string,
  TokenContextType extends string
> = Record<TokenContextType, Token<TokenType, TokenContextType>[]>




export interface Lexeme<TokenType extends string, TokenContextType extends string> {
  token: Token<TokenType, TokenContextType>
  i: number
  value: string
}




export function tokenize<
  TokenType extends string,
  TokenContextType extends string
>(
  input: string,
  contexts: ContextsOfTokens<TokenType, TokenContextType>,
  rootContext: TokenContextType,
): Lexeme<TokenType, TokenContextType>[] {
  type T = TokenType
  type Ctx = TokenContextType
  type Lx = Lexeme<T, Ctx>
  
  const lexemes: Lx[] = []
  const ctxStack: Ctx[] = [rootContext]
  
  for (let i = 0; i < input.length; ) {
    const ctx = ctxStack.at(-1)!
    
    const availableTokens = contexts[ctx]
    if (!availableTokens?.length) {
      throw new Error(`No available tokens for context '${ctx}'`)
    }
    
    const lexeme = matchToken(input, i, availableTokens)
    if (!lexeme) {
      throw new Error(
        `No lexeme found at ${i} for '${input.substring(i, i + 16)}'... in context '${ctx}'`
      )
    }
    
    const { type, startCtx, endCtx } = lexeme.token
    if (endCtx) {
      if (ctx !== endCtx) {
        throw new Error(`Token of type '${type}' must be in context '${ctx}'`)
      }
      arrDropLast(ctxStack)
    }
    if (startCtx) {
      ctxStack.push(startCtx)
    }
    
    lexemes.push(lexeme)
    i = lexeme.i + lexeme.value.length
  }
  
  if (!eqJson(ctxStack, [rootContext])) {
    throw new Error(`Unclosed contexts: ${JSON.stringify(ctxStack.slice(1))}`)
  }
  
  return lexemes
}




function matchToken<
  TokenType extends string,
  TokenContextType extends string
>(
  input: string,
  i: number,
  tokens: Token<TokenType, TokenContextType>[],
): Lexeme<TokenType, TokenContextType> | undefined {
  for (const token of tokens) {
    if (notundef(token.string)) {
      const value = input.substring(i, i + token.string.length)
      if (token.string === value) {
        return { token, i, value }
      }
    }
    else if (token.pattern) {
      const fromValue = input.substring(i)
      const match = fromValue.match(token.pattern)
      if (match) {
        const [value] = match
        return { token, i, value }
      }
    }
    else if (token.matcher) {
      const match = token.matcher(input, i)
      if (match) {
        const { i, value } = match
        return { token, i, value }
      }
    }
  }
}
