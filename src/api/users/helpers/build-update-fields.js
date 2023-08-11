function buildUpdateFields(entity, fields) {
  return Object.entries(entity)
    .filter(([field, value]) => fields.includes(field) && value !== undefined)
    .map(([field, value]) => [field, value])
}

export { buildUpdateFields }
