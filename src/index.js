'use strict'
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
require('dayjs/locale/ko')
dayjs.locale('ko')

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

    //TEST
    // const findTxns = await strapi.entityService.findMany(
    //   'api::transaction-record.transaction-record',
    //   {
    //     fields: ['id', 'amount'],
    //     filters: {
    //       type: 'CREDIT',
    //       ref_id: 'SUCCESS',
    //     },
    //   }
    // )
    // console.log('⭐  findTxns:', findTxns)
  },
}
