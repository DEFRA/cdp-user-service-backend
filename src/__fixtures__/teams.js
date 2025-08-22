import { ObjectId } from 'mongodb'

const platformTeamFixture = {
  _id: 'platform',
  name: 'Platform',
  description: 'The team that runs the platform',
  github: 'cdp-platform',
  serviceCodes: ['CDP'],
  alertEmailAddresses: ['mary@mary.com'],
  alertEnvironments: ['infra-dev', 'management'],
  createdAt: '2023-09-28T13:52:01.906Z',
  updatedAt: '2024-12-04T08:17:06.795Z',
  users: ['62bb35d2-d4f2-4cf6-abd3-262d99727677'], // admin user
  scopes: [
    new ObjectId('67500e94922c4fe819dd8832'), // externalTestScopeFixture
    new ObjectId('7751e606a171ebffac3cc9dd') // adminScopeFixture
  ]
}

const tenantTeamFixture = {
  _id: 'animalsandplants',
  name: 'AnimalsAndPlants',
  description: 'A team for the animals and plants',
  github: 'cdp-animals-and-plants',
  serviceCodes: ['AAP'],
  alertEmailAddresses: [],
  createdAt: '2024-12-03T12:26:10.858Z',
  updatedAt: '2024-12-04T08:17:06.796Z',
  users: ['b7606810-f0c6-4db7-b067-ba730ef706e8'], // userTwoFixture
  scopes: [new ObjectId('6751b8bcfd2ecb117d6277de')] // postgresScopeFixture
}

const teamWithoutUsers = {
  _id: 'f09b562e-ed21-428c-a617-8d1bb1f32720',
  name: 'TeamWithoutUsers',
  description: 'An team with no users',
  github: 'cdp-demo1',
  serviceCodes: ['CDP'],
  alertEmailAddresses: [],
  createdAt: '2023-11-03T17:05:55.470Z',
  updatedAt: '2024-11-08T14:23:08.076Z',
  users: [],
  scopes: []
}

export { platformTeamFixture, tenantTeamFixture, teamWithoutUsers }
