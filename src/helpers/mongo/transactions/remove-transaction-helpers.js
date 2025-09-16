import { ObjectId } from 'mongodb'

function removeTeamFromUser({ db, session, userId, teamId }) {
  return db.collection('users').findOneAndUpdate(
    { _id: userId },
    { $pull: { teams: teamId }, $currentDate: { updatedAt: true } },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

function removeUserFromTeam({ db, session, userId, teamId }) {
  return db.collection('teams').findOneAndUpdate(
    { _id: teamId },
    {
      $pull: { users: userId },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

async function removeTeamScopesFromUser({ db, session, userId, teamId }) {
  const team = await db
    .collection('teams')
    .findOne({ _id: teamId }, { projection: { scopes: 1 } }, { session })

  const teamScopeIds = team?.scopes?.map(({ scopeId }) => scopeId) ?? []

  if (teamScopeIds.length > 0) {
    return db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          scopes: {
            scopeId: { $in: teamScopeIds }
          }
        },
        $currentDate: { updatedAt: true }
      },
      {
        upsert: false,
        returnDocument: 'after',
        session
      }
    )
  }

  return null
}

function removeScopeFromUser({ db, session, scopeId, userId }) {
  const filter = {
    _id: userId,
    scopes: {
      $elemMatch: {
        scopeId: new ObjectId(scopeId)
      }
    }
  }

  return db.collection('users').findOneAndUpdate(
    filter,
    {
      $pull: {
        scopes: {
          scopeId: new ObjectId(scopeId)
        }
      },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

function removeUserFromScope({ db, session, scopeId, userId }) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $pull: { users: { userId } }, $currentDate: { updatedAt: true } },
      { session }
    )
}

function removeTeamFromScopes({ db, session, teamId }) {
  return db.collection('scopes').updateMany(
    { $or: [{ 'teams.teamId': teamId }, { 'members.teamId': teamId }] },
    {
      $pull: {
        teams: { teamId },
        members: { teamId }
      },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

function removeScopeFromUsers({ db, session, scopeId }) {
  return db.collection('users').updateMany(
    { 'scopes.scopeId': new ObjectId(scopeId) },
    {
      $pull: { scopes: { scopeId: new ObjectId(scopeId) } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export {
  removeTeamFromUser,
  removeUserFromTeam,
  removeTeamScopesFromUser,
  removeScopeFromUser,
  removeUserFromScope,
  removeTeamFromScopes,
  removeScopeFromUsers
}
