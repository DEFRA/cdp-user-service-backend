import { ObjectId } from 'mongodb'

const userAdminFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  name: 'TetsuoShima',
  email: 'tetsuo.shima@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'TetsuoShima',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474'], // platformTeamFixture
  scopes: [
    { scopeId: new ObjectId('6751e606a171ebffac3cc9dd') }, // prodAccessScopeFixture
    { scopeId: new ObjectId('7751e606a171ebffac3cc9dd') } // adminScopeFixture
  ]
}

const userAdminWithTeamBreakGlassFixture = {
  ...userAdminFixture,
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'), // prodAccessScopeFixture
      teamId: 'aabe63e7-87ef-4beb-a596-c810631fc474' // platformTeamFixture
    }
  ]
}

const userAdminOtherFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276zz',
  name: 'Leland Palmer',
  email: 'leland.palmer@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'LelandPalmer',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474'], // platformTeamFixture
  scopes: []
}

const userAdminWithTestAsTenantFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276dd',
  name: 'Admin AsTenant',
  email: 'admin.astenant@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'AdminAsTenant',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474'], // platformTeamFixture
  scopes: [
    { scopeId: new ObjectId('6751e606a171ebffac3cc9dd') }, // prodAccessScopeFixture
    { scopeId: new ObjectId('7751e606a171ebffac3cc9dd') }, // adminScopeFixture
    { scopeId: new ObjectId('7751e606a171ebffac3cc9ff') } // testAsTenantScopeFixture
  ]
}

const userWithGranularScopesFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276ee',
  name: 'Tenant WithGranularScopes',
  email: 'tenant.withgranularscopes@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'tenantWithGranularScopes',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'), // prodAccessScopeFixture for tenant team for 2 hours
      startDate: '2025-08-12T13:16:00.000Z',
      endDate: '2025-08-12T15:16:00.000Z',
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9dd'), // adminScopeFixture
      startDate: '2025-08-10T13:16:00.000Z',
      endDate: '2025-08-15T15:16:00.000Z'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture before 'today'
      startDate: '2025-08-10T13:16:00.000Z',
      endDate: '2025-08-10T11:16:00.000Z'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture starts after 'today'
      startDate: '2025-10-10T13:16:00.000Z'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture ends before 'today',
      endDate: '2025-08-10T13:16:00.000Z'
    },
    {
      scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'), // terminalScopeFixture for tenant team
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55'
    }
  ]
}

const userTenantFixture = {
  _id: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
  name: 'Akira',
  email: 'akira@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [{ scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc') }] // terminalScopeFixture
}

const userPostgresFixture = {
  _id: 'ad760f75-0930-434f-8a4e-174f74723c65',
  name: 'RoboCop',
  email: 'robocop@defra.onmicrosoft.com',
  createdAt: '2023-10-28T13:55:42.049Z',
  updatedAt: '2024-08-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [{ scopeId: new ObjectId('6751b8bcfd2ecb117d6277de') }] // postgresScopeFixture
}

export {
  userAdminFixture,
  userAdminWithTeamBreakGlassFixture,
  userAdminOtherFixture,
  userAdminWithTestAsTenantFixture,
  userTenantFixture,
  userPostgresFixture,
  userWithGranularScopesFixture
}
