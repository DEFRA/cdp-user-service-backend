import { ObjectId } from 'mongodb'

const externalTestScopeFixture = {
  _id: new ObjectId('67500e94922c4fe819dd8832'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'externalTest',
  description: 'Allow teams to access external test environment',
  kind: ['team'],
  users: [],
  teams: [
    {
      teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
      teamName: 'Platform'
    }
  ],
  createdAt: '2024-12-04T08:11:00.441Z',
  updatedAt: '2024-12-04T08:17:06.797Z'
}

const postgresScopeFixture = {
  _id: new ObjectId('6751b8bcfd2ecb117d6277de'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'postgres',
  kind: ['team'],
  description: 'Allow teams to create services backend by a postgres database',
  users: [],
  teams: [
    {
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
      teamName: 'AnimalsAndPlants'
    }
  ],
  createdAt: '2024-12-05T14:29:16.437Z',
  updatedAt: '2024-12-05T14:29:16.437Z'
}

const terminalScopeFixture = {
  _id: new ObjectId('6751e5e9a171ebffac3cc9dc'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'terminal',
  kind: ['team'],
  description: 'Allow teams to access the CDP terminal',
  users: [],
  teams: [
    {
      teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
      teamName: 'Platform'
    }
  ],
  createdAt: '2024-12-05T17:42:01.063Z',
  updatedAt: '2024-12-05T17:42:01.063Z'
}

const prodAccessScopeFixture = {
  _id: new ObjectId('6751e606a171ebffac3cc9dd'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'prodAccess',
  kind: ['user'],
  description: 'Allow users or teams to access higher environments',
  users: [],
  teams: [
    {
      teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
      teamName: 'Platform'
    }
  ],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-06T17:42:30.508Z'
}

const canGrantProdAccessScopeFixture = {
  _id: new ObjectId('689f152d37490a37b1bbf51f'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'canGrantProdAccess',
  kind: ['member'],
  description:
    "Tenant user is allowed to provide team members with the 'prodAccess' permission",
  teams: [
    {
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
      teamName: 'AnimalsAndPlants'
    }
  ],
  users: [],
  createdAt: '2025-08-15T11:08:29.452Z',
  updatedAt: '2025-08-22T21:12:12.205Z'
}

const adminScopeFixture = {
  _id: new ObjectId('7751e606a171ebffac3cc9dd'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'admin',
  kind: ['user', 'team'],
  description: 'Allows team to administer the Portal',
  users: [],
  teams: [
    {
      teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474',
      teamName: 'Platform'
    }
  ],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-05T17:42:30.508Z'
}

const testAsTenantScopeFixture = {
  _id: new ObjectId('7751e606a171ebffac3cc9ff'),
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'testAsTenant',
  kind: ['user'],
  description: 'Allows team to test the Portal without admin rights',
  users: [],
  teams: [],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-05T17:42:30.508Z'
}

export {
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  canGrantProdAccessScopeFixture,
  prodAccessScopeFixture,
  adminScopeFixture,
  testAsTenantScopeFixture
}
