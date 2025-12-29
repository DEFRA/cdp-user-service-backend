async function getActiveBreakGlass(db, credentials) {
  const userId = credentials.id

  const teamScopedBreakglass = await db
    .collection('relationships')
    .find({
      subject: userId,
      subjectType: 'user',
      relation: 'breakGlass'
    })
    .toArray()

  return {
    activeBreakGlass:
      teamScopedBreakglass
        .map((s) => ({
          scopeId: 'breakGlass',
          scopeName: 'breakGlass',
          teamId: s.resource,
          teamName: s.resource,
          startAt: s.start,
          endAt: s.end
        }))
        .at(0) ?? null
  }
}

export { getActiveBreakGlass }
