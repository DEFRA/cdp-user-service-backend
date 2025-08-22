import { addYears } from './add-years.js'

describe('#addYears', () => {
  test('Should adds positive years to a given date', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, 5)

    expect(result.getFullYear()).toBe(2028)
  })

  test('Original dare should be immutable', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, 5)

    expect(result.getFullYear()).toBe(2028)
    expect(date.getFullYear()).toBe(2023)
  })

  test('Should adds negative years to a given date', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, -3)

    expect(result.getFullYear()).toBe(2020)
  })

  test('Should handles adding zero years to a given date', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, 0)

    expect(result.getFullYear()).toBe(2023)
  })

  test('Should handles large positive year additions', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, 1000)

    expect(result.getFullYear()).toBe(3023)
  })

  test('Should handles large negative year additions', () => {
    const date = new Date(2023, 0, 1)
    const result = addYears(date, -1000)

    expect(result.getFullYear()).toBe(1023)
  })
})
