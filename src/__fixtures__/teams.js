import { ObjectId } from 'mongodb'

const platformTeamFixture = {
  _id: 'aabe63e7-87ef-4beb-a596-c810631fc474',
  name: 'Platform',
  description: 'The team that runs the platform',
  createdAt: '2023-09-28T13:52:01.906Z',
  updatedAt: '2024-12-04T08:17:06.795Z',
  users: ['62bb35d2-d4f2-4cf6-abd3-262d99727677'],
  github: 'cdp-platform',
  serviceCodes: ['CDP'],
  alertEmailAddresses: ['mary@mary.com'],
  scopes: [new ObjectId('67500e94922c4fe819dd8832')]
}

const tenantTeamFixture = {
  _id: '2a45e0cd-9f1b-4158-825d-40e561c55c55',
  name: 'AnimalsAndPlants',
  description: 'A team for the animals and plants',
  github: 'cdp-demo1',
  serviceCodes: ['RTY'],
  alertEmailAddresses: [],
  createdAt: '2024-12-03T12:26:10.858Z',
  updatedAt: '2024-12-04T08:17:06.796Z',
  users: ['b7606810-f0c6-4db7-b067-ba730ef706e8'],
  scopes: [new ObjectId('67500e94922c4fe819dd8832')]
}

export { platformTeamFixture, tenantTeamFixture }
