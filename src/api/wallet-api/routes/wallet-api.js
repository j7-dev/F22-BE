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
      method: 'GET',
      path: '/wallet-api/balance/calculate',
      handler: 'balance.calculate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
