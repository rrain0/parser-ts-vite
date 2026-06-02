export { }



declare global {
  
  // ℹ️ Object modifiers
  
  // +partial +undefined
  export type Opt<O extends object> = {
    [Prop in keyof O]+?: O[Prop] | undefined
  }
  
  
  
  
  // ℹ️ Records
  
  // +partial
  export type RecordPart<K extends keyof any, T> = {
    [P in K]+?: T
  }
  // +undefined
  export type RecordUndef<K extends keyof any, T> = {
    [P in K]: T | undefined
  }
  // +partial +undefined
  export type RecordOpt<K extends keyof any, T> = {
    [P in K]+?: T | undefined
  }
  
}
