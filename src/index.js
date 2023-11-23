'use strict'
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
require('dayjs/locale/ko')
dayjs.locale('ko')
const TIMEZONE = 'Etc/GMT'
dayjs.tz.setDefault(TIMEZONE)

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

    // 將韓國時間轉換為 UTC+0時間

    const UTC9toUTC0 = (dayjsObj, format = 'YYYY-MM-DD HH:mm:ss.SSSSSS') => {
      return dayjs
        .tz(dayjsObj.format('YYYY-MM-DDTHH:mm:ss[Z]'), 'Asia/Seoul')
        .utc()
        .format(format)
    }

    // 將 siteSetting 設定到 global 全域變數
    global.appData = {
      siteSetting,
      gameProvider,
      UTC9toUTC0,
    }

    //TEST
    //     const getDepositSQL = `
    // 		SELECT SUM(tr.amount) AS totalDeposit
    // FROM transaction_records tr
    // JOIN transaction_records_user_links trul ON tr.id = trul.transaction_record_id
    // WHERE tr.type = 'DEPOSIT'
    //   AND tr.status = 'SUCCESS'
    //   AND tr.currency = 'KRW'
    //   AND tr.amount_type = 'CASH'
    //   AND trul.user_id IN (26)
    //   AND tr.created_at >= '2023-09-19T00:00:00.000Z'
    //   AND tr.created_at <= '2023-10-28T00:00:00.000Z';`

    //     const queryResult = await strapi.db.connection.raw(getDepositSQL)
    // console.log('⭐  findTxns:', findTxns)

    // const user_id = 1

    // const userDeposit = await strapi
    //   .service('plugin::utility.bettingAmount')
    //   .get({
    //     type: ['DEPOSIT'],
    //     currency: 'KRW',
    //     amount_type: 'CASH',
    //     user_id: user_id,
    //   })
    // console.log('⭐  userDeposit:', userDeposit)
  },
}
