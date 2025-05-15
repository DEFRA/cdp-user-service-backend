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
    new ObjectId('6751e606a171ebffac3cc9dd'), // breakGlassFixture
    new ObjectId('7751e606a171ebffac3cc9dd') // adminScopeFixture
  ]
}

const userTenantFixture = {
  _id: 'b7606810-f0c6-4db7-b067-ba730ef706e8',
  name: 'Akira',
  email: 'akira@defra.onmicrosoft.com',
  createdAt: '2023-09-28T13:55:42.049Z',
  updatedAt: '2024-07-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [new ObjectId('6751e5e9a171ebffac3cc9dc')] // terminalScopeFixture
}

const userPostgresFixture = {
  _id: 'ad760f75-0930-434f-8a4e-174f74723c65',
  name: 'RoboCop',
  email: 'robocop@defra.onmicrosoft.com',
  createdAt: '2023-10-28T13:55:42.049Z',
  updatedAt: '2024-08-15T09:56:32.809Z',
  teams: ['2a45e0cd-9f1b-4158-825d-40e561c55c55'], // tenantTeamFixture
  scopes: [new ObjectId('6751b8bcfd2ecb117d6277de')] // postgresScopeFixture
}

export { userAdminFixture, userTenantFixture, userPostgresFixture }
