'use strict'
const dayjs = require('dayjs')

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    //test

    const start = dayjs()
      .subtract(7, 'day')
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    const end = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    const result = await strapi
      .service('plugin::utility.bettingAmount')
      .getWin({
        start,
        end,
      })

    console.log('⭐  bootstrap  result', result)
  },
}
