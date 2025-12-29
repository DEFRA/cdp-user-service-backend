import { activePermissionFilter } from './active-permission-filter.js'

async function generateMermaidDiagram(db, subject) {
  const activeWindow = activePermissionFilter()

  const result = await db
    .collection('relationships')
    .aggregate([
      {
        $match: { subject, ...activeWindow }
      },
      {
        $graphLookup: {
          from: 'relationships',
          startWith: '$resource',
          connectFromField: 'resource',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5,
          restrictSearchWithMatch: activeWindow
        }
      }
    ])
    .toArray()

  const seen = new Set()

  const ids = {
    team: new Set(),
    user: new Set(),
    permission: new Set(),
    entity: new Set()
  }

  for (const r of result) {
    ids[r.subjectType].add(r.subject)
    ids[r.resourceType].add(r.resource)
    seen.add(`${r.subject} -->|${r.relation}| ${r.resource}`)
    r.path.forEach((p) => {
      ids[p.subjectType].add(p.subject)
      ids[p.resourceType].add(p.resource)
      seen.add(`${p.subject} -->|${p.relation}| ${p.resource}`)
    })
  }

  let mermaid = 'flowchart TD\n'
  mermaid += 'subgraph team\n'
  ids.team.forEach((id) => {
    mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  mermaid += 'subgraph user\n'
  ids.user.forEach((id) => {
    mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  mermaid += 'subgraph permissions\n'
  ids.permission.forEach((id) => {
    mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  /*mermaid += 'subgraph service\n'
  ids.forEach((id) => {
    if (id.startsWith('service:')) mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'
*/
  seen.forEach((p) => {
    mermaid += p.replaceAll('@', '_') + '\n'
  })
  mermaid += '\n'

  return mermaid
}

export { generateMermaidDiagram }
