module.exports = {
  async afterUpdate(event) {
    const { result } = event

    const { createdBy, updatedBy, ...rest } = result
    global.appData = {
      siteSetting: rest,
    }
  },
}
