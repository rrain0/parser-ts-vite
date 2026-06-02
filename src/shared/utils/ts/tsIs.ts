
type nullish = null | undefined
type anyfun = (...args: any[]) => any

export type Isobject<T> = T extends object ? T extends anyfun ? never : T : never



// ℹ️ Check type via 'typeof'

// IS 'undefined'
export function isundef<T>(value: T | undefined): value is undefined {
  return value === undefined
}

// NOT 'undefined'
export function notundef<T>(value: T | undefined): value is T {
  return value !== undefined
}

// IS 'null'
export function isnull<T>(value: T | null): value is null {
  return value === null
}

// NOT 'null'
export function notnull<T>(value: T | null): value is T {
  return value !== null
}

// NOT 'null' & NOT 'undefined'
export function notnullish<E extends {}, T>(value: T | E): value is E {
  return value !== null && value !== undefined
}

// IS 'null' or IS 'undefined'
export function isnullish<NE extends nullish, T>(value: T | NE): value is NE {
  return value === null || value === undefined
}

// IS 'boolean'
export function isbool<B extends boolean, T>(value: T | B): value is B {
  return typeof value === 'boolean'
}

// IS 'string'
export function isstring<S extends string, T>(value: T | S): value is S {
  return typeof value === 'string'
}

// IS 'number'
export function isnumber<N extends number, T>(value: T | N): value is N {
  return typeof value === 'number'
}

// IS 'function'
export function isfunction<F extends Function, T>(value: T | F): value is F {
  return typeof value === 'function'
}

// IS object (IS 'object' & NOT 'null')
export function isobject<T>(value: T): value is Isobject<T> {
  return typeof value === 'object' && value !== null
}



// ℹ️ Check type via 'instanceof'

// IS 'Object'
export function isObject<O extends object, T>(value: T | O): value is O {
  return value instanceof Object
}

// IS 'Array'
export function isArray<A extends any[], T>(value: T | A): value is A {
  return value instanceof Array
}

// IS 'Function'
export function isFunction<F extends Function, T>(value: T | F): value is F {
  return value instanceof Function
}

// IS Record (IS 'Object' & NOT 'Array' & NOT 'Function'
export function isRecord<R extends object, T>(value: R | any[] | anyfun | T): value is R {
  return isObject(value) && !isArray(value) && !isFunction(value)
}




// ℹ️ Never assertion

export function assertNever(value: never): never {
  throw new Error(
    `This code must not be reached because value must be never, but it is: ${value}`,
  )
}

export function assertNeverTrue(value: false): never {
  throw new Error(
    `This code must not be reached because value must be false, but it is: ${value}`,
  )
}
