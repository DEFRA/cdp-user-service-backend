import isArray from 'lodash/isArray.js'
import isNull from 'lodash/isNull.js'
import isUndefined from 'lodash/isUndefined.js'

function buildUpdateFields(existingEntity, updatedEntity, fields) {
  if (isNull(existingEntity) || isNull(updatedEntity) || !isArray(fields)) {
    return null
  }

  return fields.reduce((obj, field) => {
    const existingValue = existingEntity[field]
    const updatedValue = updatedEntity[field]

    if (existingValue !== updatedValue && !isUndefined(updatedValue)) {
      if (!isNull(updatedValue)) {
        return {
          ...obj,
          $set: {
            ...obj?.$set,
            [field]: updatedValue
          }
        }
      }

      return {
        ...obj,
        $unset: {
          ...obj?.$unset,
          [field]: updatedValue
        }
      }
    }

    return obj
  }, null)
}

export { buildUpdateFields }
