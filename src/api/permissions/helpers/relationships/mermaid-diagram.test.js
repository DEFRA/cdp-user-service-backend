import { relationshipsToMermaidFlowChart } from './mermaid-diagram.js'

describe('#mermaid-diagrams', () => {
  test('it renders a valid mermaid flowchart', () => {
    const relationships = [
      {
        subject: 'userid',
        subjectType: 'user',
        relation: 'member',
        resource: 'teamname',
        resourceType: 'team',
        path: [
          {
            subject: 'teamname',
            subjectType: 'team',
            relation: 'granted',
            resource: 'admin',
            resourceType: 'permission'
          }
        ]
      },
      {
        subject: 'userid',
        subjectType: 'user',
        relation: 'granted',
        resource: 'externalTest',
        resourceType: 'permission',
        path: []
      }
    ]

    const diagram = relationshipsToMermaidFlowChart(relationships)
    expect(diagram).toContain(`flowchart TD
subgraph team
    teamname
end
subgraph user
    userid
end
subgraph permissions
    admin
    externalTest
end
userid -->|member| teamname
teamname -->|granted| admin
userid -->|granted| externalTest
`)
  })
})
