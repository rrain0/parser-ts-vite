export { }



declare global {
  interface ObjectConstructor {
    
    keys<O extends object>(object: O): ObjectKeys<O>;
    
    values<O extends object>(object: O): ObjectValues<O>
    
    entries<O extends object>(object: O): ObjectEntries<O>
    
    fromEntries<
      E extends readonly (readonly [PropertyKey, any])[]
    >(entries: E): ObjectFromEntriesArr<E>
    
  }
}



type ObjectKey<O extends object> = keyof O
type ObjectValue<O extends object> = O[keyof O]
type ObjectEntry<O extends object> = [keyof O, O[keyof O]]
// too complex for typescript in some cases
//type ObjectEntry<O extends object> = { [Prop in keyof O]: [Prop, O[Prop]] }[keyof O]


type ObjectKeys<O extends object> = ObjectKey<O>[]
type ObjectValues<O extends object> = ObjectValue<O>[]


type ObjectEntries<O extends object> = ObjectEntry<O>[]


type ObjectFromEntriesArr<A extends readonly (readonly [PropertyKey, any])[]> = {
  [E in A[number] as E[0]]: E[1]
}
