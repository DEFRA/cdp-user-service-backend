import { generateMermaidDiagram } from '../helpers/relationships/mermaid-diagram.js'
import { getUserOnly } from '../../users/helpers/get-user.js'
import Boom from '@hapi/boom'

const mermaidDiagramController = {
  options: {},
  handler: async (request, h) => {
    const userId = request.query.user
    const user = await getUserOnly(request.db, userId)
    if (!user) {
      throw Boom.notFound('User not found')
    }

    const mermaid = await generateMermaidDiagram(request.db, userId)
    return h.response(mermaid).type('text/plain').code(200)
  }
}

export { mermaidDiagramController }
