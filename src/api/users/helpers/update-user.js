import { getUser } from '~/src/api/users/helpers/get-user'

async function updateUser(db, userId, updateFields) {
  const updatedFields = {
    ...updateFields,
    updatedAt: new Date()
  }
  await db
    .collection('users')
    .findOneAndUpdate({ _id: userId }, { $set: updatedFields })
  return await getUser(db, userId)
}

export { updateUser }
