module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/wallet-api/balance/get',
      handler: 'balance.get',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wallet-api/balance/add',
      handler: 'balance.add',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wallet-api/balance/add-without-record',
      handler: 'balance.addWithoutRecord',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wallet-api/trunoverbonus-to-cash',
      handler: 'balance.trunoverBonusToCash',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wallet-api/cash/withdraw',
      handler: 'cash.withdraw',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wallet-api/cash/deposit',
      handler: 'cash.deposit',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
