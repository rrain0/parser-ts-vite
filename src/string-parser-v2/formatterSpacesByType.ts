import type { Lexeme } from '@/string-parser-v2/tokenizer.ts'



export type FormatterSpacesByType<TokenType extends string> = RecordOpt<
  TokenType,
  Opt<{ l: number, r: number, remove: boolean }>
>



export function formatSpacesByType<TokenType extends string>(
  lexemes: Lexeme<TokenType, any>[],
  spacesByType: FormatterSpacesByType<TokenType>
): string {
  let result = ''
  
  for (let i = 0; i < lexemes.length; i++) {
    const lexeme = lexemes[i]
    const { l, r, remove } = spacesByType[lexeme.token.type] ?? { }
    
    if (l && l > 0) result = result.padEnd(result.length + l, ' ')
    if (!remove) result += lexeme.value
    if (r && r > 0) result = result.padEnd(result.length + r, ' ')
  }
  
  return result
}
