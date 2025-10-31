import { checkDirect, checkPathAny, checkPathExact } from './permissions.js'

/**
 * @typedef {{ direct: string, object: string }} Direct
 * @typedef {{ path: string[], object: string }} Indirect
 * @param {any} db
 * @param {string} subject
 * @param  {any[]}  expr
 * @returns {Promise<boolean|boolean>}
 */
async function evalRule(db, subject, expr) {
  if (Array.isArray(expr)) {
    const [op, ...operands] = expr

    if (op === 'AND') {
      for (const sub of operands) {
        const r = await evalRule(db, subject, sub)
        if (!r) return false
      }
      return true
    }

    if (op === 'OR') {
      for (const sub of operands) {
        const r = await evalRule(db, subject, sub)
        if (r) return true
      }
      return false
    }

    if (op === 'NOT') {
      return !(await evalRule(db, subject, operands[0]))
    }

    throw new Error(`Unknown operator: ${op}`)
  }

  if (expr.if === false) {
    return true
  }

  // Leaf conditions
  if (expr.direct) {
    return checkDirect(db, subject, {
      relation: expr.direct,
      object: expr.object
    })
  }

  if (expr.path) {
    if (expr.path.includes('*')) {
      // wildcard "any path ending with terminal relation"
      const terminalRel = expr.path[expr.path.length - 1]
      return checkPathAny(db, subject, expr.object, terminalRel)
    } else {
      return checkPathExact(db, subject, expr.object, expr.path)
    }
  }

  throw new Error('Invalid condition node')
}

export async function canAccess(db, subject, policy, input) {
  if (!policy) return false

  // TODO: maybe use validate or do this somewhere else?
  const { value, error } = policy.context.validate(input)
  if (error) {
    throw new Error(error)
  }

  const res = await evalRule(db, subject, policy.conditions(value))

  if (res) return true
  return false
}
