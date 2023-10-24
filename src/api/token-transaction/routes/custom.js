module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/tokenapi/transaction',
      handler: 'token-transaction.create',
    },
    {
      method: 'GET',
      path: '/tokenapi/transaction',
      handler: 'token-transaction.get',
    },
  ],
}
