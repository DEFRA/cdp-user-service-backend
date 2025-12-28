export const scopeDefinitions = {
  externalTest: {
    scopeId: 'externalTest',
    value: 'externalTest',
    description:
      'Allow teams to view and deploy to the external test environment',
    kind: ['team']
  },
  restrictedTechPython: {
    scopeId: 'restrictedTechPython',
    value: 'restrictedTechPython',
    kind: ['user', 'team'],
    description:
      'A restricted tech permission to provide Python service creation and management to a team or user'
  },
  restrictedTechPostgres: {
    scopeId: 'restrictedTechPostgres',
    value: 'restrictedTechPostgres',
    kind: ['user', 'team'],
    description:
      'A restricted tech permission to allow Postgres service management to a team or user'
  },
  admin: {
    scopeId: 'admin',
    value: 'admin',
    kind: ['team'],
    description: 'CDP Portal Admin permissions'
  },
  testAsTenant: {
    scopeId: 'testAsTenant',
    value: 'testAsTenant',
    kind: ['user'],
    description:
      'When added to an individual, it will temporarily disable admin permission to allow the user to test the portal as if they were a tenant.'
  },
  breakGlass: {
    scopeId: 'breakGlass',
    value: 'breakGlass',
    kind: ['user', 'member'],
    description:
      'Allow users access to the production environment via the CDP Terminal'
  },
  canGrantBreakGlass: {
    scopeId: 'canGrantBreakGlass',
    value: 'canGrantBreakGlass',
    kind: ['user'],
    description:
      "Allow a member of a team to grant the 'breakGlass' permission to team members"
  }
}
