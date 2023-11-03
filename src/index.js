'use strict'
// const dayjs = require('dayjs')

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
      'api::site-setting.site-setting',
      {
        populate: {
          default_vip: {
            fields: ['id', 'label'],
          },
        },
      }
    )
    const gameProvider = {
      EVO: {
        txn: 'api::evo-transaction.evo-transaction',
      },
      PP: {
        txn: 'api::pp-transaction.pp-transaction',
      },
    }
    // 將 siteSetting 設定到 global 全域變數
    global.appData = {
      siteSetting,
      gameProvider,
    }

    // TODO 開遊戲前確認每個人身上的權限能不能開
    // const start = dayjs().startOf('year').format('YYYY-MM-DD HH:mm:ss.SSSSSS')
    // const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS')

    // console.log('⭐  turnoverBonusTxns:', JSON.stringify(gpTxns))
  },
}
