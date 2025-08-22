function addYears(value, amount) {
  const date = new Date(value)
  date.setFullYear(date.getFullYear() + amount)
  return date
}

export { addYears }
