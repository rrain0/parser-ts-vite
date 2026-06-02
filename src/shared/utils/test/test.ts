


export function strInputComment(input: string, comment?: string) {
  if (!comment) return input
  return `${input} - ${comment}`
}
