const removeUndefinedKeys = (obj) => {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    } else if (typeof obj[key] === 'object') {
      removeUndefinedKeys(obj[key]) // 递归处理嵌套对象
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key]
      }
    }
  }

  return obj
}

const countByDate = ({ startD, endD }) => {
  const diff = endD.diff(startD, 'day')

  const data =
    diff > 1
      ? new Array(diff).fill(0).map((item, index) => {
          return {
            startD:
              index === 0 ? startD : startD.add(index, 'day').startOf('day'),
            endD:
              index === diff - 1 ? endD : startD.add(index, 'day').endOf('day'),
          }
        })
      : [
          {
            startD,
            endD,
          },
        ]

  return data
}

module.exports = {
  removeUndefinedKeys,
  countByDate,
}
