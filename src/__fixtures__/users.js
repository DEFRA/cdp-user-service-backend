import { ObjectId } from 'mongodb'

const userAdminFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d99727677',
  name: 'Admin User',
  email: 'admin.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'AdminUser',
  teams: ['platform'],
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
      scopeName: 'breakGlass'
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
      scopeName: 'breakGlass'
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
  teams: ['platform'],
  scopes: []
}

const userAdminWithTestAsTenantFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276dd',
  name: 'Admin AsTenant',
  email: 'admin.astenant@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'AdminAsTenant',
  teams: ['platform'],
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'),
      scopeName: 'breakGlass'
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

const memberWithGranularScopesFixture = {
  _id: '62bb35d2-d4f2-4cf6-abd3-262d997276ee',
  name: 'Tenant WithGranularScopes',
  email: 'tenant.withgranularscopes@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:53:44.948Z',
  updatedAt: '2024-12-03T12:26:28.965Z',
  github: 'tenantWithGranularScopes',
  teams: ['animalsandplants'],
  scopes: [
    {
      scopeId: new ObjectId('6751e606a171ebffac3cc9dd'), // breakGlass for tenant team for 2 hours
      scopeName: 'breakGlass',
      teamId: 'animalsandplants',
      teamName: 'AnimalsAndPlants',
      startDate: new Date('2025-08-12T13:16:00.000Z'),
      endDate: new Date('2025-08-12T15:16:00.000Z')
    },
    {
      scopeId: new ObjectId('689f152d37490a37b1bbf51f'), // canGrantBreakGlass for tenant team for 2 hours
      scopeName: 'canGrantBreakGlass',
      teamId: 'animalsandplants',
      teamName: 'AnimalsAndPlants',
      startDate: new Date('2025-08-12T13:16:00.000Z'),
      endDate: new Date('2025-08-12T15:16:00.000Z')
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

const userTenantFixture = {
  _id: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
  name: 'Tenant User',
  email: 'tenant.user@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  teams: ['animalsandplants'],
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
  teams: ['animalsandplants'],
  scopes: [
    {
      scopeId: new ObjectId('6751b8bcfd2ecb117d6277de'),
      scopeName: 'postgres'
    }
  ]
}

const userTenantWithoutTeamFixture = {
  _id: 'd4f4c751-50e2-4d39-96e3-19b9974b04a5',
  name: 'Fred Tenant User',
  email: 'fred.tenant.user@defra.onmicrosoft.com',
  createdAt: '2024-09-28T13:55:42.049Z',
  updatedAt: '2025-07-15T09:56:32.809Z',
  teams: [],
  scopes: []
}

export {
  userAdminFixture,
  userAdminWithTeamBreakGlassFixture,
  userAdminOtherFixture,
  userAdminWithTestAsTenantFixture,
  userTenantFixture,
  userTenantWithoutTeamFixture,
  userPostgresFixture,
  memberWithGranularScopesFixture
}
