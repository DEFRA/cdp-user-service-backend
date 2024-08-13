import { buildUpdateFields } from '~/src/helpers/build-update-fields.js'

describe('#buildUpdateFields', () => {
  it('should return null when any input is null', () => {
    expect(buildUpdateFields(null, {}, ['field1'])).toBeNull()
    expect(buildUpdateFields({}, null, ['field1'])).toBeNull()
    expect(buildUpdateFields({}, {}, null)).toBeNull()
  })

  it('should return null when fields is not an array', () => {
    expect(buildUpdateFields({}, {}, 'field1')).toBeNull()
  })

  it('should return null when there are no differences', () => {
    const existingEntity = {
      field1: 'value1',
      field2: 'value2'
    }
    const updatedEntity = {
      field1: 'value1',
      field2: 'value2'
    }
    const fieldsToUpdate = ['field1', 'field2']
    expect(
      buildUpdateFields(existingEntity, updatedEntity, fieldsToUpdate)
    ).toBeNull()
  })

  it('should return an object with only the relevant fields to be updated', () => {
    const existingEntity = {
      userId: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      age: 25,
      address: 'abc'
    }
    const updatedEntity = {
      name: 'John Doe',
      email: 'john@doe2.com',
      age: 25,
      address: 'abcd'
    }
    const allowedFields = ['name', 'email', 'gender']
    const updateFields = buildUpdateFields(
      existingEntity,
      updatedEntity,
      allowedFields
    )
    const expectedUpdateFields = {
      $set: {
        email: 'john@doe2.com'
      }
    }
    expect(updateFields).toEqual(expectedUpdateFields)
  })

  it('should separate null values into $unset object', () => {
    const existingEntity = {
      userId: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      age: 25,
      address: 'abc',
      gender: 'X'
    }
    const updatedEntity = {
      userId: 123,
      name: 'John Doe',
      email: 'john@doe2.com',
      age: null,
      address: 'abc',
      gender: null
    }
    const allowedFields = ['name', 'email', 'age', 'gender']
    const updateFields = buildUpdateFields(
      existingEntity,
      updatedEntity,
      allowedFields
    )
    const expectedUpdateFields = {
      $set: {
        email: 'john@doe2.com'
      },
      $unset: {
        gender: null,
        age: null
      }
    }
    expect(updateFields).toEqual(expectedUpdateFields)
  })
})
