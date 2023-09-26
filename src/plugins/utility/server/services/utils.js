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

module.exports = {
  removeUndefinedKeys,
}
