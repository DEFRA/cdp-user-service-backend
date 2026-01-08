import { findRelationshipGraphForUser } from './relationships.js'

async function generateMermaidDiagram(db, subject) {
  const result = await findRelationshipGraphForUser(db, subject)
  return relationshipsToMermaidFlowChart(result)
}

function relationshipsToMermaidFlowChart(relationships) {
  const seen = new Set()

  const ids = {
    team: new Set(),
    user: new Set(),
    permission: new Set()
  }

  for (const r of relationships) {
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
    mermaid += `    ${id}\n`
  })
  mermaid += 'end\n'

  mermaid += 'subgraph user\n'
  ids.user.forEach((id) => {
    mermaid += `    ${id}\n`
  })
  mermaid += 'end\n'

  mermaid += 'subgraph permissions\n'
  ids.permission.forEach((id) => {
    mermaid += `    ${id}\n`
  })
  mermaid += 'end\n'

  seen.forEach((p) => {
    mermaid += p.replaceAll('@', '_') + '\n'
  })
  mermaid += '\n'

  return mermaid
}

export { generateMermaidDiagram, relationshipsToMermaidFlowChart }
