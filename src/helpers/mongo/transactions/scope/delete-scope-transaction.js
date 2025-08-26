import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeScopeFromTeam } from './remove-scope-from-team-transaction.js'
import { removeScopeFromUser } from './remove-scope-from-user-transaction.js'
import { removeMemberScopeFromUser } from './remove-scope-from-member-transaction.js'

async function deleteScopeTransaction(request, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    const scope = await db
      .collection('scopes')
      .findOne({ _id: new ObjectId(scopeId) })

    const teamPromises = scope.teams.map((team) =>
      removeScopeFromTeam({
        db,
        teamId: team.teamId,
        scopeId,
        scopeName: scope.value
      })
    )
    const userPromises = scope.users.map((user) =>
      removeScopeFromUser({ db, scopeId, userId: user.userId })
    )
    const memberPromises = scope.members.map((member) =>
      removeMemberScopeFromUser({
        db,
        scopeId,
        userId: member.userId,
        teamId: member.teamId
      })
    )

    await Promise.all([...teamPromises, ...userPromises, ...memberPromises])

    return await deleteScope(db, scopeId)
  })
}

function deleteScope(db, scopeId) {
  return db
    .collection('scopes')
    .findOneAndDelete({ _id: new ObjectId(scopeId) })
}

export { deleteScopeTransaction }
