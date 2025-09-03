import { ObjectId } from 'mongodb'
import { UTCDate } from '@date-fns/utc'

import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeNil } from '../../../remove-nil.js'

async function addScopeToMemberTransaction({
  request,
  userId,
  userName,
  scopeId,
  scopeName,
  teamId,
  teamName,
  startDate,
  endDate
}) {
  const db = request.db
  const utcDateNow = new UTCDate()

  return withMongoTransaction(request, async () => {
    await removeOldScopesFromUser({ db, userId, scopeName, utcDateNow })

    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: removeNil({
            scopeId: new ObjectId(scopeId),
            scopeName,
            teamId,
            teamName,
            startDate,
            endDate
          })
        },
        $set: { updatedAt: utcDateNow }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    await removeOldMembersFromScope({ db, scopeId, userId, utcDateNow })

    return addMemberToScope({
      db,
      values: { userId, userName, teamId, teamName, startDate, endDate },
      scopeId,
      utcDateNow
    })
  })
}

async function removeOldScopesFromUser({ db, userId, scopeName, utcDateNow }) {
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $pull: {
        scopes: {
          scopeName,
          endDate: { $lt: utcDateNow }
        }
      },
      $set: { updatedAt: utcDateNow }
    }
  )
}

function addMemberToScope({ db, values, scopeId, utcDateNow }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { members: removeNil(values) },
      $set: { updatedAt: utcDateNow }
    }
  )
}

async function removeOldMembersFromScope({ db, scopeId, userId, utcDateNow }) {
  await db.collection('scopes').updateOne(
    { _id: new ObjectId(scopeId) },
    {
      $pull: {
        members: {
          userId,
          endDate: { $lt: utcDateNow }
        }
      },
      $set: { updatedAt: utcDateNow }
    }
  )
}

export { addScopeToMemberTransaction }
