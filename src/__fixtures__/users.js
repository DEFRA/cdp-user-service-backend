import { ObjectId } from 'mongodb'

const userAdminFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  name: 'Admin User',
  email: 'admin.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'AdminUser',
  teams: ['aabe63e7-87ef-4beb-a596-c810631fc474'], // platformTeamFixture
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
      scopeName: 'prodAccess'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9dd'),
      scopeName: 'admin'
    }
  ]
}

const userAdminWithTeamBreakGlassFixture = {
  ...userAdminFixture,
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
      scopeName: 'prodAccess'
    }
  ]
}

const userAdminOtherFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276zz',
  name: 'Admin User Other',
  email: 'admin.user.other@defra.onmicrosoft.com',
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
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
      scopeName: 'prodAccess'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9dd'),
      scopeName: 'admin'
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'),
      scopeName: 'testAsTenant'
    }
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
      scopeName: 'testAsTenant',
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
      teamName: 'AnimalsAndPlants',
      startDate: new Date('2025-08-12T13:16:00.000Z'),
      endDate: new Date('2025-08-12T15:16:00.000Z')
    },
    {
      scopeId: new ObjectId('689f152d37490a37b1bbf51f'), // prodAccessScopeFixture for tenant team for 2 hours
      scopeName: 'canGrantProdAccess',
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
      teamName: 'AnimalsAndPlants',
      startDate: new Date('2025-08-12T13:16:00.000Z'),
      endDate: new Date('2025-08-12T15:16:00.000Z')
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9dd'), // adminScopeFixture
      scopeName: 'admin',
      startDate: new Date('2025-08-10T13:16:00.000Z'),
      endDate: new Date('2025-08-15T15:16:00.000Z')
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture before 'today'
      scopeName: 'testAsTenant',
      startDate: new Date('2025-08-10T13:16:00.000Z'),
      endDate: new Date('2025-08-10T11:16:00.000Z')
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture starts after 'today'
      scopeName: 'testAsTenant',
      startDate: new Date('2025-10-10T13:16:00.000Z'),
      endDate: new Date('2025-10-11T13:16:00.000Z')
    },
    {
      scopeId: new ObjectId('7751e606a171ebffac3cc9ff'), // testAsTenantScopeFixture ends before 'today',
      scopeName: 'testAsTenant',
      startDate: new Date('2025-08-09T13:16:00.000Z'),
      endDate: new Date('2025-08-10T13:16:00.000Z')
    },
    {
      scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'), // terminalScopeFixture for tenant team
      scopeName: 'testAsTenant',
      teamId: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
      teamName: 'AnimalsAndPlants'
    }
  ]
}

const userTenantFixture = {
  _id: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
  name: 'Tenant User',
  email: 'tenant.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [
    {
      scopeId: new ObjectId('6751e5e9a171ebffac3cc9dc'),
      scopeName: 'terminal'
    }
  ]
}

const userPostgresFixture = {
  _id: 'ad760f75-0930-434f-8a4e-174f74723c65',
  name: 'Postgres User',
  email: 'postgres.user@defra.onmicrosoft.com',
  createdAt: '2023-10-28T13:55:42.049Z',
  updatedAt: '2024-08-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [
    {
      scopeId: new ObjectId('6751b8bcfd2ecb117d6277de'),
      scopeName: 'postgres'
    }
  ]
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
