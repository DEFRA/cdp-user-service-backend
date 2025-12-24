const collection = 'relationships'

/**
 *
 * @param {{}} db
 * @param { string } subject
 * @param {{ relation: string, resource: string }} cond
 * @returns {Promise<boolean>}
 */
async function checkDirect(db, subject, cond) {
  return !!(await db.collection(collection).findOne({
    subject,
    relation: cond.relation,
    resource: cond.resource
  }))
}

async function checkPathExact(db, subject, target, path) {
  let current = [subject]
  for (const rel of path) {
    const next = await db
      .collection(collection)
      .find({ subject: { $in: current }, relation: rel })
      .map((r) => r.resource)
      .toArray()

    if (next.length === 0) return false

    current = next
  }
  return current.includes(target)
}

async function checkPathAny(db, subject, target, terminalRel) {
  const result = await db
    .collection(collection)
    .aggregate([
      { $match: { subject } },
      {
        $graphLookup: {
          from: collection,
          startWith: '$resource',
          connectFromField: 'resource',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5
        }
      }
    ])
    .toArray()

  for (const start of result) {
    const rels = [start.relation, ...start.path.map((p) => p.relation)]
    const objs = [start.resource, ...start.path.map((p) => p.resource)]

    // terminalRel must appear and line up with the target
    for (let i = 0; i < rels.length; i++) {
      if (rels[i] === terminalRel && objs[i] === target) {
        return true
      }
    }
  }
  return false
}

export { checkDirect, checkPathAny, checkPathExact }
