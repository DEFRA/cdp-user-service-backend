import { config } from '~/src/config/config.js'

async function gitHubUserExists(octokit, github) {
  const org = config.get('gitHubOrg')
  const userExistsInOrgQuery = `
  query userExistsInOrg($user: String!, $orgName: String!) {
    user(login: $user) {
      github: login
      organization(login: $orgName) {
        github: login
      }
    }
  }`

  try {
    const result = await octokit.graphql(userExistsInOrgQuery, {
      user: github,
      orgName: org
    })

    return (
      result?.user?.github === github &&
      result?.user?.organization?.github === org
    )
  } catch (error) {
    if (error?.errors?.at(0)?.type === 'NOT_FOUND') {
      return false
    }
    throw error
  }
}

export { gitHubUserExists }
