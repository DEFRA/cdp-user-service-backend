import isNil from 'lodash/isNil.js'
import { teamAggregation } from './aggregations/team.js'

async function getTeams(db, queryParams) {
  const stages = []
  const query = queryParams?.query
  const name = queryParams?.name
  const hasGithub = queryParams?.hasGithub

  const filter = {}

  if (!isNil(name)) {
    filter.name = name

    stages.push({
      $match: { name }
    })
  }

  if (!isNil(hasGithub)) {
    filter.github = { $exists: hasGithub }
    stages.push({
      $match: { github: { $exists: hasGithub } }
    })
  }

  if (!isNil(query)) {
    filter.name = { $regex: query, $options: 'i' }
    stages.push({
      $match: {
        $or: [{ name: { $regex: query, $options: 'i' } }]
      }
    })
  }

  stages.push(...teamAggregation, { $sort: { name: 1 } })

  return await db.collection('teams').aggregate(stages).toArray()
}

async function getTeamsCount(db, query) {
  return await db.collection('teams').countDocuments(query)
}

export { getTeams, getTeamsCount }
