


export function arrDropLast(arr: any[], dropCnt = 1) {
  arr.length = Math.max(arr.length - dropCnt, 0)
}
