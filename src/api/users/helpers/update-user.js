import { getUser } from '~/src/api/users/helpers/get-user'

async function updateUser(db, userId, updateFields) {
  await db
    .collection('users')
    .findOneAndUpdate({ _id: userId }, { $set: updateFields })
  return await getUser(db, userId)
}

export { updateUser }
