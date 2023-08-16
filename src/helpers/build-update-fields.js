function buildUpdateFields(entity, fields) {
  const updateFields = Object.entries(entity)
    .filter(([field, value]) => fields.includes(field) && value !== undefined)
    .map(([field, value]) => [field, value])
  return Object.fromEntries(updateFields)
}

export { buildUpdateFields }
