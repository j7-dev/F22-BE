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
    const siteSetting = await strapi.entityService.findMany(
      'api::site-setting.site-setting'
    )
    // 將 siteSetting 設定到 global 全域變數
    global.appData = {
      siteSetting,
    }

    // TODO 開遊戲前確認每個人身上的權限能不能開
  },
}
