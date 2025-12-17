export const scopeDefinitions = {
  externalTest: {
    value: 'externalTest',
    kind: ['team'],
    description:
      'Allow teams to view and deploy to the external test environment'
  },
  restrictedTechPython: {
    value: 'restrictedTechPython',
    kind: ['user', 'team'],
    description:
      'A restricted tech permission to provide Python service creation and management to a team or user'
  },
  restrictedTechPostgres: {
    value: 'restrictedTechPostgres',
    kind: ['user', 'team'],
    description:
      'A restricted tech permission to allow Postgres service management to a team or user'
  },
  admin: {
    value: 'admin',
    kind: ['team'],
    description: 'CDP Portal Admin permissions'
  },
  testAsTenant: {
    value: 'testAsTenant',
    kind: ['user'],
    description:
      'When added to an individual, it will temporarily disable admin permission to allow the user to test the portal as if they were a tenant.'
  },
  breakGlass: {
    value: 'breakGlass',
    kind: ['user', 'member'],
    description:
      'Allow users access to the production environment via the CDP Terminal'
  },
  canGrantBreakGlass: {
    value: 'canGrantBreakGlass',
    kind: ['user'],
    description:
      "Allow a member of a team to grant the 'breakGlass' permission to team members"
  }
}
