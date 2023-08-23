import { isNull, isUndefined } from 'lodash'

function buildUpdateFields(entity, fields) {
  return Object.entries(entity)
    .filter(([field, value]) => fields.includes(field) && !isUndefined(value))
    .reduce(
      (obj, [field, value]) => {
        if (!isNull(value)) {
          return { ...obj, [field]: value }
        }

        return {
          ...obj,
          $unset: {
            ...obj.$unset,
            [field]: value
          }
        }
      },
      { $unset: {} }
    )
}

export { buildUpdateFields }
