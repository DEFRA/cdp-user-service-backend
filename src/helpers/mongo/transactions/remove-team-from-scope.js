import { ObjectId } from 'mongodb'

async function removeTeamFromScope(request, teamId, scopeId) {
  const db = request.db
  return await db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $pull: { teams: teamId }, $set: { updatedAt: new Date() } }
    )
}

export { removeTeamFromScope }
