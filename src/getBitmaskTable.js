const getBitmaskTable = names => {
  const table = {}
  names.forEach((name, i) => {
    table[name] = 2 ** i
  })
  return table
}

export default getBitmaskTable
