// TODO DELETE

// function getTxnStatus({ isFinish, winLoss }) {
//   if (!isFinish) return 'GAMING'
//   if (winLoss > 0) return 'WIN'
//   if (winLoss < 0) return 'LOSE'
//   return 'DRAW'
// }

module.exports = {
  // async afterCreate(event) {
  //   // preset
  //   const siteSetting = global.appData.siteSetting
  //   const defaultAmountType = siteSetting?.default_amount_type || 'CASH'
  //   const GAME_PROVIDER = 'EVO'
  //   const RESOURCE = global.appData?.gameProvider?.[GAME_PROVIDER]?.txn
  //   // 取得 event.result
  //   const { result } = event
  //   const transaction_type = result?.transaction_type || '' // DEBIT / CREDIT /CANCEL
  //   // 找出對應 transaction_ref_id 把同遊戲的所有交易都找出來
  //   const allTxns = await strapi.entityService.findMany(RESOURCE, {
  //     filters: {
  //       game_provider_transaction_id: result?.transaction_ref_id,
  //       game_provider: GAME_PROVIDER,
  //     },
  //     populate: {
  //       user: {
  //         fields: ['id'],
  //       },
  //     },
  //   })
  //   const allCreditTxns = allTxns.filter(
  //     (txn) => txn.transaction_type === 'CREDIT'
  //   )
  //   const allCreditTxnAmount = allCreditTxns.reduce(
  //     (acc, cur) => acc + cur.amount,
  //     0
  //   )
  //   const allDebitTxns = allTxns.filter(
  //     (txn) => txn.transaction_type === 'DEBIT'
  //   )
  //   const allDebitTxnAmount = allDebitTxns.reduce(
  //     (acc, cur) => acc + cur.amount,
  //     0
  //   )
  //   const allCancelTxns = allTxns.filter(
  //     (txn) => txn.transaction_type === 'CANCEL'
  //   )
  //   const allCancelTxnAmount = allCancelTxns.reduce(
  //     (acc, cur) => acc + cur.amount,
  //     0
  //   )
  //   const winLoss = allCreditTxnAmount - allDebitTxnAmount - allCancelTxnAmount
  //   // 找出對應 transaction_id && game_provider 的 bet record
  //   const betRecords = await strapi.entityService.findMany(
  //     'api::bet-record.bet-record',
  //     {
  //       filters: {
  //         transaction_id: result?.transaction_id,
  //         game_provider: 'EVO',
  //       },
  //       populate: {
  //         debit_txns: {
  //           fields: ['id'],
  //         },
  //         credit_txns: {
  //           fields: ['id'],
  //         },
  //       },
  //     }
  //   )
  //   if (!betRecords.length) {
  //     const data = {
  //       status: getTxnStatus({
  //         isFinish,
  //         winLoss,
  //       }), // DRAW | WIN | LOSE | CANCEL | GAMING
  //       stake: allDebitTxnAmount,
  //       actual_stake: allDebitTxnAmount,
  //       currency: result.currency,
  //       amount_type: defaultAmountType,
  //       game_provider: GAME_PROVIDER,
  //       game_provider_transaction_id: result.transaction_ref_id,
  //     }
  //     if (isFinish) {
  //       data.winloss = winLoss
  //     }
  //     // 沒有對應的 bet record 創一個
  //     const createResult = await strapi.entityService.create(
  //       'api::bet-record.bet-record',
  //       {
  //         data,
  //       }
  //     )
  //     console.log('⭐  createResult:', createResult)
  //   } else {
  //     const theBetRecord = betRecords[0]
  //     const data = {
  //       status: getTxnStatus({
  //         isFinish,
  //         winLoss,
  //       }), // DRAW | WIN | LOSE | CANCEL | GAMING
  //       stake: allDebitTxnAmount,
  //       actual_stake: allDebitTxnAmount,
  //     }
  //     if (isFinish) {
  //       data.winloss = winLoss
  //     }
  //     // 更新 bet record
  //     const updateResult = await strapi.entityService.update(
  //       'api::bet-record.bet-record',
  //       theBetRecord.id,
  //       {
  //         data,
  //       }
  //     )
  //     console.log('⭐  updateResult:', updateResult)
  //   }
  // },
}
