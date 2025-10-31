import { connectToTestMongoDB } from '../../../test-helpers/connect-to-test-mongodb.js'
import {
  addRelationship,
  createIndexes,
  drawPerms,
  findMembersOfTeam
} from './permissions.js'
import { canAccess } from './eval.js'
import { policyIsAdmin, policyCanDeployService } from './policies.js'

describe('#permissions', () => {
  const request = {}

  beforeAll(async () => {
    const { db, mongoClient } = await connectToTestMongoDB()
    request.db = db
    request.mongoClient = mongoClient
  })

  beforeEach(async () => {
    await request.db.collection('relationships').drop()
    await createIndexes(request.db)
  })

  test('#policyIsAdmin', async () => {
    await addRelationship(request.db, 'user:bob', 'granted', 'perm:admin')
    expect(await canAccess(request.db, 'user:bob', policyIsAdmin, {})).toBe(
      true
    )
  })

  test('#policyCanDeployService non-admin, non-ext-test', async () => {
    const relationships = [
      ['user:bob', 'member', 'team:tenant'],
      ['team:tenant', 'owner', 'service:api']
    ]

    for (const r of relationships) {
      await addRelationship(request.db, r[0], r[1], r[2])
    }

    const result = await canAccess(
      request.db,
      'user:bob',
      policyCanDeployService,
      { service: 'service:api', env: 'dev' }
    )
    expect(result).toBe(true)
  })

  test('#policyCanDeployService admin can deploy anywhere', async () => {
    const relationships = [
      ['user:a', 'granted', 'perm:admin'],
      ['user:b', 'member', 'team:platform'],
      ['team:platform', 'granted', 'perm:admin'],
      ['team:tenant', 'owner', 'service:api']
    ]

    for (const r of relationships) {
      await addRelationship(request.db, r[0], r[1], r[2])
    }

    const canUserADeploy = await canAccess(
      request.db,
      'user:a',
      policyCanDeployService,
      { service: 'service:api', env: 'dev' }
    )
    expect(canUserADeploy).toBe(true)

    const canUserBDeploy = await canAccess(
      request.db,
      'user:b',
      policyCanDeployService,
      { service: 'service:api', env: 'dev' }
    )
    expect(canUserBDeploy).toBe(true)
  })

  test('#deployService non-admin, ext-test permission', async () => {
    const relationships = [
      ['user:bob', 'member', 'team:tenant'],
      ['team:tenant', 'owner', 'service:api'],
      ['team:tenant', 'granted', 'perm:ext-test'],
      ['team:platform', 'owner', 'service:portal-frontend']
    ]

    for (const r of relationships) {
      await addRelationship(request.db, r[0], r[1], r[2])
    }

    const testData = [
      ['user:bob', { service: 'service:api', env: 'dev' }, true],
      ['user:bob', { service: 'service:api', env: 'ext-test' }, true],
      ['user:bob', { service: 'service:portal-frontend', env: 'dev' }, false],
      [
        'user:bob',
        { service: 'service:portal-frontend', env: 'ext-test' },
        false
      ]
    ]

    for (const data of testData) {
      const result = await canAccess(
        request.db,
        data[0],
        policyCanDeployService,
        data[1]
      )
      // eslint-disable-next-line vitest/valid-expect
      expect(result, `input ${JSON.stringify(data)}`).toBe(data[2])
    }
  })

  test('can tell us whos a member of a team', async () => {
    await addRelationship(request.db, 'user:jim', 'member', 'team:platform')
    await addRelationship(request.db, 'user:jim', 'member', 'team:tenant')
    await addRelationship(request.db, 'user:barry', 'member', 'team:platform')
    await addRelationship(request.db, 'user:ian', 'member', 'team:platform')
    await addRelationship(request.db, 'user:bob', 'member', 'team:tenant')

    const result = await findMembersOfTeam(request.db, 'team:platform')
    expect(result.length).toBe(3)
    expect(result.sort()).toEqual(['user:barry', 'user:ian', 'user:jim'])

    const membersOfTenantTeam = await findMembersOfTeam(
      request.db,
      'team:tenant'
    )
    expect(membersOfTenantTeam.length).toBe(2)
    expect(membersOfTenantTeam.sort()).toEqual(['user:bob', 'user:jim'])
  })

  test('draw perms', async () => {
    await addRelationship(request.db, 'user:jim', 'member', 'team:platform')
    await addRelationship(request.db, 'user:jim', 'granted', 'perm:admin')
    await addRelationship(request.db, 'user:jim', 'breakglass', 'team:platform')
    await addRelationship(
      request.db,
      'team:platform',
      'owns',
      'service:frontend'
    )
    await addRelationship(
      request.db,
      'team:platform',
      'owns',
      'service:backend'
    )
    await addRelationship(request.db, 'team:tenant', 'owns', 'service:forms')
    await addRelationship(request.db, 'service:frontend', 'access', 'db:forms')

    const result = await checkPath(request.db, 'user:jim', 'service:frontend', {
      path: ['breakglass', 'owns']
    })

    expect(result).toBe(true)
    await drawPerms(request.db, 'user:jim', '', {})
  })
})
