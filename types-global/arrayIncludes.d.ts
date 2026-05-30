export { }



declare global {
  interface Array<const T> {
    includes<const E>(
      searchElement: T | (T extends E ? E : never), fromIndex?: number
    ): searchElement is T
  }
  interface ReadonlyArray<T> {
    includes<const E>(
      searchElement: T | (T extends E ? E : never), fromIndex?: number
    ): searchElement is T
  }
}
