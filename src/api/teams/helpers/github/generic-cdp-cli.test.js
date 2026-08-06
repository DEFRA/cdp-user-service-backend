import {
  buildGenericCdpCommand,
  createTeamCommand,
  publishTeamCommand,
  removeTeamCommand,
  updateTeamCommand
} from './generic-cdp-cli.js'

describe('cdp-generic-cli workflow input builder', () => {
  test('it generates inputs for create team', () => {
    const workflowInput = buildGenericCdpCommand('1234', [
      createTeamCommand({
        team_id: 'foo',
        name: 'Foo',
        description: 'A team description',
        service_code: 'FOO',
        github: 'footeam',
        delivery_group_id: 'fishing'
      })
    ])

    const jsonVersion = JSON.stringify(workflowInput)
    expect(jsonVersion).toEqual(
      `{"run_id":"1234","commands":"[\\"team add --team-id 'foo' --team-name 'Foo' --description 'A team description' --github 'footeam' --service-code 'FOO' --delivery-group-id 'fishing'\\"]"}`
    )
  })

  test('it generates inputs for update team', () => {
    const workflowInput = buildGenericCdpCommand('1234', [
      updateTeamCommand({
        team_id: 'foo',
        name: 'Foo',
        description: 'A team description',
        service_code: 'FOO',
        github: 'footeam',
        slack_non_prod: 'foo-non-prod',
        slack_team: 'foo-team',
        slack_prod: 'foo-prod',
        delivery_group_id: 'fishing'
      })
    ])

    const jsonVersion = JSON.stringify(workflowInput)
    expect(jsonVersion).toEqual(
      `{"run_id":"1234","commands":"[\\"team update --team-id 'foo' --team-name 'Foo' --description 'A team description' --github 'footeam' --service-code 'FOO' --slack-prod 'foo-prod' --slack-non-prod 'foo-non-prod' --slack-team 'foo-team' --delivery-group-id 'fishing'\\"]"}`
    )
  })

  test('it generates inputs for remove team', () => {
    const workflowInput = buildGenericCdpCommand('1234', [
      removeTeamCommand('foo')
    ])

    const jsonVersion = JSON.stringify(workflowInput)
    expect(jsonVersion).toEqual(
      `{"run_id":"1234","commands":"[\\"team remove --team-id 'foo'\\"]"}`
    )
  })

  test('it generates inputs for publish team', () => {
    const workflowInput = buildGenericCdpCommand('1234', [publishTeamCommand()])

    const jsonVersion = JSON.stringify(workflowInput)
    expect(jsonVersion).toEqual(
      `{"run_id":"1234","commands":"[\\"team publish\\"]"}`
    )
  })

  test('it generates inputs for multiple commands team', () => {
    const workflowInput = buildGenericCdpCommand('1234', [
      'command one',
      'command two'
    ])

    const jsonVersion = JSON.stringify(workflowInput)
    expect(jsonVersion).toEqual(
      `{"run_id":"1234","commands":"[\\"command one\\",\\"command two\\"]"}`
    )
  })
})
