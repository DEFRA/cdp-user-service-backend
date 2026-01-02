import { deepStrictEqual } from 'assert'
import { originalScopesForUser } from '../original-scopes-for-user.js'

import { scopesForUser } from './legacy-scopes-for-user.js'

async function checkScopeMigration(db) {
  const userIds = await db
    .collection('users')
    .find()
    .project({ _id: 1, name: 1 })
    .toArray()

  const output = []

  for (const user of userIds) {
    const v2Perms = await scopesForUser(db, user._id)
    const v1Perms = await originalScopesForUser({ id: user._id }, db)

    v2Perms.scopes.sort()
    v1Perms.scopes.sort()

    let areEqual = false
    try {
      deepStrictEqual(v1Perms, v2Perms)
      areEqual = true
    } catch (error) {
      // ignore
    }

    output.push({
      ok: areEqual,
      v1Perms,
      v2Perms,
      user
    })
  }

  return output
}

async function compareScopesOverview(db) {
  const results = await checkScopeMigration(db)

  const failed = results.filter((r) => !r.ok)
  return {
    pass: results.every((r) => r.ok),
    overview: `${results.reduce((acc, user) => (user.ok ? acc + 1 : acc), 0)}/${results.length} passed`,
    failed
  }
}

export { checkScopeMigration, compareScopesOverview }
