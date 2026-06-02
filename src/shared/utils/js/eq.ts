


export type Equalitier<A, B = A> = (a: A, b: B) => boolean



export const eqAny: Equalitier<any> = (a, b) => a === b

export function eqJson(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}
