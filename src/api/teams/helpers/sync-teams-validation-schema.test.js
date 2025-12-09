import { syncTeamsValidationSchema } from './sync-teams-validation-schema.js'

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
          serviceCodes: ['CDP']
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

    expect(validCode.error).toBeUndefined()
    expect(invalidCode.error).toBeDefined()
    expect(invalidShortCode.error).toBeDefined()
  })
})
