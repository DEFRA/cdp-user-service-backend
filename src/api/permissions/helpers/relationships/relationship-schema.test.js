import { strictRelationshipSchema } from './relationship-schema.js'

describe('relationship schema', () => {
  test('breakglass requires a user and a team', () => {
    const validResult = strictRelationshipSchema.validate({
      subject: 'userid',
      subjectType: 'user',
      relation: 'breakGlass',
      resource: 'platform',
      resourceType: 'team'
    })

    const invalidResult = strictRelationshipSchema.validate({
      subject: 'platform',
      subjectType: 'team',
      relation: 'breakGlass',
      resource: 'user1',
      resourceType: 'user'
    })

    expect(validResult.error).toBeUndefined()
    expect(invalidResult.error).toBeDefined()
  })

  test('member requires a user and a team', () => {
    const validResult = strictRelationshipSchema.validate({
      subject: 'userid',
      subjectType: 'user',
      relation: 'member',
      resource: 'platform',
      resourceType: 'team'
    })

    const invalidResult = strictRelationshipSchema.validate({
      subject: 'platform',
      subjectType: 'team',
      relation: 'member',
      resource: 'user1',
      resourceType: 'user'
    })

    const invalidResult2 = strictRelationshipSchema.validate({
      subject: 'platform',
      subjectType: 'team',
      relation: 'member',
      resource: 'permission1',
      resourceType: 'permission'
    })

    expect(validResult.error).toBeUndefined()
    expect(invalidResult.error).toBeDefined()
    expect(invalidResult2.error).toBeDefined()
  })

  test('granted requires a user or team and permission', () => {
    const validResult1 = strictRelationshipSchema.validate({
      subject: 'userid',
      subjectType: 'user',
      relation: 'granted',
      resource: 'permission1',
      resourceType: 'permission'
    })

    const validResult2 = strictRelationshipSchema.validate({
      subject: 'teamid',
      subjectType: 'team',
      relation: 'granted',
      resource: 'permission1',
      resourceType: 'permission'
    })

    const invalidResult1 = strictRelationshipSchema.validate({
      subject: 'teamid',
      subjectType: 'team',
      relation: 'granted',
      resource: 'team1',
      resourceType: 'team1'
    })

    const invalidResult2 = strictRelationshipSchema.validate({
      subject: 'user1',
      subjectType: 'user',
      relation: 'granted',
      resource: 'user2',
      resourceType: 'user'
    })

    expect(validResult1.error).toBeUndefined()
    expect(validResult2.error).toBeUndefined()

    expect(invalidResult1.error).toBeDefined()
    expect(invalidResult2.error).toBeDefined()
  })
})
