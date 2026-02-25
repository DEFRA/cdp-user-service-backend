import {
  createTeamValidationSchema,
  syncTeamsValidationSchema,
  updateTeamValidationSchema
} from './schemas.js'

describe('#createTeamSchema', () => {
  it('accepts minimal valid requests', () => {
    const team = {
      name: 'foo',
      description: 'foo team'
    }
    const valid = createTeamValidationSchema.validate(team)
    expect(valid.error).toBeUndefined()
    expect(valid.value).toMatchObject(team)
  })

  it('accepts full valid requests', () => {
    const team = {
      name: 'foo',
      description: 'foo team',
      github: 'foo',
      serviceCodes: ['FOO'],
      alertEmailAddresses: ['foo@bar.com', 'a@b.com'],
      alertEnvironments: [
        'prod',
        'test',
        'dev',
        'perf-test',
        'ext-test',
        'infra-dev',
        'management'
      ],
      slackChannels: {
        prod: 'foo-prod-alerts',
        nonProd: 'foo-non-prod-alerts',
        team: 'foo-team'
      }
    }
    const valid = createTeamValidationSchema.validate(team)
    expect(valid.error).toBeUndefined()
    expect(valid.value).toMatchObject(team)
  })

  it('rejects invalid requests', () => {
    const team = {
      description: 'foo team'
    }
    const valid = createTeamValidationSchema.validate(team)
    expect(valid.error).toBeDefined()
  })
})

describe('#updateTeamSchema', () => {
  it('accepts minimal valid requests', () => {
    const team = {}
    const valid = updateTeamValidationSchema.validate(team)
    expect(valid.error).toBeUndefined()
    expect(valid.value).toMatchObject(team)
  })

  it('accepts full valid requests', () => {
    const team = {
      name: 'foo',
      description: 'foo team',
      github: 'foo',
      serviceCodes: ['FOO'],
      alertEmailAddresses: ['foo@bar.com', 'a@b.com'],
      alertEnvironments: [
        'prod',
        'test',
        'dev',
        'perf-test',
        'ext-test',
        'infra-dev',
        'management'
      ],
      slackChannels: {
        prod: 'foo-prod-alerts',
        nonProd: 'foo-non-prod-alerts',
        team: 'foo-team'
      }
    }
    const valid = updateTeamValidationSchema.validate(team)
    expect(valid.error).toBeUndefined()
    expect(valid.value).toMatchObject(team)
  })

  it('rejects invalid requests', () => {
    const team = {
      slackChannels: []
    }
    const valid = updateTeamValidationSchema.validate(team)
    expect(valid.error).toBeDefined()
  })
})

describe('#synTeamsValidationSchema', () => {
  it('accepts teamId in correct format', () => {
    const valid = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name'
        }
      ]
    })

    const invalid = syncTeamsValidationSchema.validate({
      teams: [{ teamId: 'Team Id.', name: 'Team-Name' }]
    })

    expect(valid.error).toBeUndefined()
    expect(invalid.error).toBeDefined()
  })

  test('accepts full object', () => {
    const valid = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name',
          description: 'Description',
          github: 'github',
          serviceCodes: ['CDP'],
          slackChannels: {
            prod: '#team-prod-alerts',
            nonProd: '#team-non-prod-alerts',
            team: '#team'
          }
        }
      ]
    })

    expect(valid.error).toBeUndefined()
  })

  test('serviceCode is validated', () => {
    const validCode = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name',
          serviceCodes: ['CDP']
        }
      ]
    })

    const invalidCode = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name',
          serviceCodes: ['cdp']
        }
      ]
    })

    const invalidShortCode = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name',
          serviceCodes: ['c']
        }
      ]
    })

    const nullCode = syncTeamsValidationSchema.validate({
      teams: [
        {
          teamId: 'team-name',
          name: 'Team-Name',
          serviceCodes: null
        }
      ]
    })

    expect(validCode.error).toBeUndefined()
    expect(invalidCode.error).toBeDefined()
    expect(invalidShortCode.error).toBeDefined()
    expect(nullCode.error).toBeUndefined()
  })
})
