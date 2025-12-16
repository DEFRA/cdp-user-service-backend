import { ObjectId } from 'mongodb'

const externalTestScopeFixture = {
  _id: new ObjectId('67500e94922c4fe819dd8832'),
  scopeId: 'externalTest',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'externalTest',
  description: 'Allow teams to access external test environment',
  kind: ['team'],
  users: [],
  teams: [
    {
      teamId: 'platform',
      teamName: 'Platform'
    }
  ],
  members: [],
  createdAt: '2024-12-04T08:11:00.441Z',
  updatedAt: '2024-12-04T08:17:06.797Z'
}

const postgresScopeFixture = {
  _id: new ObjectId('6751b8bcfd2ecb117d6277de'),
  scopeId: 'postgres',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'postgres',
  kind: ['team'],
  description: 'Allow teams to create services backend by a postgres database',
  users: [],
  teams: [
    {
      teamId: 'animalsandplants',
      teamName: 'AnimalsAndPlants'
    }
  ],
  members: [],
  createdAt: '2024-12-05T14:29:16.437Z',
  updatedAt: '2024-12-05T14:29:16.437Z'
}

const terminalScopeFixture = {
  _id: new ObjectId('6751e5e9a171ebffac3cc9dc'),
  scopeId: 'terminal',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'terminal',
  kind: ['team'],
  description: 'Allow teams to access the CDP terminal',
  users: [],
  teams: [
    {
      teamId: 'platform',
      teamName: 'Platform'
    }
  ],
  members: [],
  createdAt: '2024-12-05T17:42:01.063Z',
  updatedAt: '2024-12-05T17:42:01.063Z'
}

const breakGlassScopeFixture = {
  _id: new ObjectId('6751e606a171ebffac3cc9dd'),
  scopeId: 'breakGlass',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'breakGlass',
  kind: ['user'],
  description: 'Allow users or teams to access higher environments',
  users: [],
  teams: [
    {
      teamId: 'platform',
      teamName: 'Platform'
    }
  ],
  members: [],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-06T17:42:30.508Z'
}

const canGrantBreakGlassScopeFixture = {
  _id: new ObjectId('689f152d37490a37b1bbf51f'),
  scopeId: 'canGrantBreakGlass',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'canGrantBreakGlass',
  kind: ['member'],
  description:
    "Tenant user is allowed to provide team members with the 'breakGlass' permission",
  users: [],
  teams: [
    {
      teamId: 'animalsandplants',
      teamName: 'AnimalsAndPlants'
    }
  ],
  members: [],
  createdAt: '2025-08-15T11:08:29.452Z',
  updatedAt: '2025-08-22T21:12:12.205Z'
}

const adminScopeFixture = {
  _id: new ObjectId('7751e606a171ebffac3cc9dd'),
  scopeId: 'admin',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'admin',
  kind: ['user', 'team'],
  description: 'Allows team to administer the Portal',
  users: [],
  teams: [
    {
      teamId: 'platform',
      teamName: 'Platform'
    }
  ],
  members: [],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-05T17:42:30.508Z'
}

const testAsTenantScopeFixture = {
  _id: new ObjectId('7751e606a171ebffac3cc9ff'),
  scopeId: 'testAsTenant',
  userId: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  value: 'testAsTenant',
  kind: ['user'],
  description: 'Allows team to test the Portal without admin rights',
  users: [],
  teams: [],
  members: [],
  createdAt: '2024-12-05T17:42:30.508Z',
  updatedAt: '2024-12-05T17:42:30.508Z'
}

export {
  externalTestScopeFixture,
  postgresScopeFixture,
  terminalScopeFixture,
  canGrantBreakGlassScopeFixture,
  breakGlassScopeFixture,
  adminScopeFixture,
  testAsTenantScopeFixture
}
