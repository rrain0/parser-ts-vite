import type { AstNode } from './parser.ts'



export function evaluate(root: AstNode, object: Record<any, any>): boolean {
  if (root.node.type !== 'Expression') {
    throw new Error(
      `root node must be of type 'Expression' but is [${JSON.stringify(root)}]`
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
    
    if (t === 'Plus') {
      value = stackFrame.l + stackFrame.r
    }
    else if (t === 'Minus') {
      value = stackFrame.l - stackFrame.r
    }
    else if (t === 'Mult') {
      value = stackFrame.l * stackFrame.r
    }
    else if (t === 'Div') {
      value = stackFrame.l / stackFrame.r
    }
    else if (t === 'Pow') {
      value = Math.pow(stackFrame.l, stackFrame.r)
    }
    else if (t === 'Sqrt') {
      value = Math.sqrt(stackFrame.r)
    }
    else if (t === 'LParen') {
      value = stackFrame.r
    }
    else if (t === 'RParen') {
      value = stackFrame.l
    }
    else if (t === 'Number') {
      value = node.value as number
    }
    else if (t === 'Idf') {
      value = object[node.value as string]
    }
    
    //console.log('value', value)
    
    node = node.up!
    stack.length = stack.length - 1
    stack.at(-1)![stackFrame.from] = value
  }
  
  return rootValue.r
}
