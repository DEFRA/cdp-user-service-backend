import { ObjectId } from 'mongodb'

const externalTestScopeFixture = {
  _id: new ObjectId('67500e94922c4fe819dd8832'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'externalTest',
  description: 'Allow teams to access external test environment',
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

const terminalScopeFixture = {
  _id: new ObjectId('6751e5e9a171ebffac3cc9dc'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'terminal',
  description: 'Allow teams to access the CDP terminal',
  teams: ['62bb35d2-d4f2-4cf6-abd3-262d99727677'],
  createdAt: '2024-12-05T17:42:01.063Z',
  updatedAt: '2024-12-05T17:42:01.063Z'
}

const breakGlassFixture = {
  _id: new ObjectId('6751e606a171ebffac3cc9dd'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'breakGlass',
  description: 'Allow users or teams to access higher environments',
  teams: ['b7606810-f0c6-4db7-b067-ba730ef706e8'],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-05T17:42:30.508Z'
}

export {
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  breakGlassFixture
}
