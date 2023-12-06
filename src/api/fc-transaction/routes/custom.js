module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/fc/transaction',
      handler: 'get-fc-transaction.main',
    },
    {
      method: 'POST',
      path: '/fc/transaction',
      handler: 'fc-transaction.create',
    },
  ],
}
