const platformTeamFixture = {
  _id: 'platform',
  name: 'Platform',
  description: 'The team that runs the platform',
  github: 'cdp-platform',
  serviceCodes: ['CDP'],
  alertEmailAddresses: ['mary@mary.com'],
  alertEnvironments: ['infra-dev', 'management'],
  slackChannels: {
    prod: 'cdp-platform-alerts',
    nonProd: 'cdp-platform-non-prod-alerts',
    team: 'cdp-platform-team'
  },
  createdAt: '2023-09-28T13:52:01.906Z',
  updatedAt: '2024-12-04T08:17:06.795Z'
}

const tenantTeamFixture = {
  _id: 'animalsandplants',
  name: 'AnimalsAndPlants',
  description: 'A team for the animals and plants',
  github: 'cdp-animals-and-plants',
  serviceCodes: ['AAP'],
  alertEmailAddresses: [],
  createdAt: '2024-12-03T12:26:10.858Z',
  updatedAt: '2024-12-04T08:17:06.796Z'
}

const teamWithoutUsers = {
  _id: 'teamwithoutusers',
  name: 'TeamWithoutUsers',
  description: 'An team with no users',
  github: 'cdp-demo1',
  serviceCodes: ['CDP'],
  alertEmailAddresses: [],
  createdAt: '2023-11-03T17:05:55.470Z',
  updatedAt: '2024-11-08T14:23:08.076Z'
}

export { platformTeamFixture, tenantTeamFixture, teamWithoutUsers }
