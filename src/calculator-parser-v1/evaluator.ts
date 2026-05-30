import type { AstNode } from './parser.ts'



export function evaluate(root: AstNode, object: Record<any, any>): boolean {
  if (root.node.type !== 'expression') {
    throw new Error(
      `root node must be of type 'expression' but is [${JSON.stringify(root)}]`
    )
  }
  // root может иметь ноду только справа
  if (!root.nodeR) return true
  
  type LR = {
    from: 'l' | 'r'
    l?: any
    r?: any
    context?: 'dot' | undefined
  }
  
  let node = root
  const rootValue: LR = { from: 'r' }
  const stack: LR[] = [rootValue]
  
  while (true) {
    const stackFrame = stack.at(-1)!
    const t = node.node.type
    
    if (!('l' in stackFrame)) {
      const needL = !!node.node.needL?.length
      
      if (!needL) stackFrame.l = undefined
      else {
        const { nodeL } = node
        
        if (!nodeL) {
          throw new Error(
            `No required left arg found for node [${JSON.stringify(node)}]`
          )
        }
        
        node = nodeL
        const context = stackFrame.context
        stack.push({ from: 'l', context })
        continue
      }
    }
    
    if (!('r' in stackFrame)) {
      const needR = !!node.node.needR?.length
      
      if (!needR) stackFrame.r = undefined
      else {
        const { nodeR } = node
        
        if (!nodeR) {
          throw new Error(
            `No required right arg found for node [${JSON.stringify(node)}]`
          )
        }
        
        node = nodeR
        const context = stackFrame.context
        stack.push({ from: 'r', context })
        continue
      }
    }
    
    if (stack.length === 1) break
    
    
    
    let value
    
    if (t === 'plus') {
      value = stackFrame.l + stackFrame.r
    }
    else if (t === 'minus') {
      value = stackFrame.l - stackFrame.r
    }
    else if (t === 'mult') {
      value = stackFrame.l * stackFrame.r
    }
    else if (t === 'div') {
      value = stackFrame.l / stackFrame.r
    }
    else if (t === 'pow') {
      value = Math.pow(stackFrame.l, stackFrame.r)
    }
    else if (t === 'sqrt') {
      value = Math.sqrt(stackFrame.r)
    }
    else if (t === 'lparen') {
      value = stackFrame.r
    }
    else if (t === 'rparen') {
      value = stackFrame.l
    }
    else if (t === 'number') {
      value = node.value as number
    }
    else if (t === 'idf') {
      value = object[node.value as string]
    }
    
    //console.log('value', value)
    
    node = node.up!
    stack.length = stack.length - 1
    stack.at(-1)![stackFrame.from] = value
  }
  
  return rootValue.r
}
