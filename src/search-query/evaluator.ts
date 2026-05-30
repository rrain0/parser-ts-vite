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
        const context = t === 'dot' ? 'dot' : stackFrame.context
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
        const context = t === 'dot' ? 'dot' : stackFrame.context
        stack.push({ from: 'r', context })
        continue
      }
    }
    
    if (stack.length === 1) break
    
    
    
    let value
    
    if (t === 'or') {
      value = stackFrame.l || stackFrame.r
    }
    else if (t === 'and') {
      value = stackFrame.l && stackFrame.r
    }
    else if (t === 'dot') {
      const path = [...stackFrame.l, ...stackFrame.r]
      if (stackFrame.context === 'dot') value = path
      else {
        value = object
        for (let i = 0; i < path.length; i++) {
          if (!(value instanceof Object)) value = undefined
          else value = value[path[i]]
        }
      }
    }
    else if (t === 'eq') {
      value = stackFrame.l === stackFrame.r
    }
    else if (t === 'neq') {
      value = stackFrame.l !== stackFrame.r
    }
    else if (t === 'gt') {
      value = stackFrame.l > stackFrame.r
    }
    else if (t === 'lt') {
      value = stackFrame.l < stackFrame.r
    }
    else if (t === 'gte') {
      value = stackFrame.l >= stackFrame.r
    }
    else if (t === 'lte') {
      value = stackFrame.l <= stackFrame.r
    }
    else if (t === 'lparen') {
      value = stackFrame.r
    }
    else if (t === 'rparen') {
      value = stackFrame.l
    }
    else if (t === 'ldquote') {
      value = stackFrame.r
    }
    else if (t === 'rdquote') {
      value = stackFrame.l
    }
    else if (t === 'string') {
      value = node.value as string
    }
    else if (t === 'number') {
      value = node.value as number
    }
    else if (t === 'idf') {
      if (stackFrame.context === 'dot') value = [node.value as string]
      else value = object[node.value as string]
    }
    
    //console.log('value', value)
    
    node = node.up!
    stack.length = stack.length - 1
    stack.at(-1)![stackFrame.from] = value
  }
  
  return !!rootValue.r
}
