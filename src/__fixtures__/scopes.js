import { ObjectId } from 'mongodb'

const externalTestScopeFixture = {
  _id: new ObjectId('67500e94922c4fe819dd8832'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'externalTest',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474'],
  createdAt: '2024-12-04T08:11:00.441Z',
  updatedAt: '2024-12-04T08:17:06.797Z'
}

const postgresScopeFixture = {
  _id: new ObjectId('6751b8bcfd2ecb117d6277de'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'postgres',
  description: 'Allow teams to create services backend by a postgres database',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'],
  createdAt: '2024-12-05T14:29:16.437Z',
  updatedAt: '2024-12-05T14:29:16.437Z'
}

export { externalTestScopeFixture, postgresScopeFixture }
