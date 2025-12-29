function activePermissionFilter() {
  const now = Date.now()
  return {
    $and: [
      {
        $or: [
          { start: { $lte: now } },
          { start: null },
          { start: { $exists: false } }
        ]
      },
      {
        $or: [
          { end: { $gte: now } },
          { end: null },
          { end: { $exists: false } }
        ]
      }
    ]
  }
}

export { activePermissionFilter }
