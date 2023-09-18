module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pp/transaction',
      handler: 'get-pp-transaction.main',
    },
    {
      method: 'POST',
      path: '/pp/transaction',
      handler: 'pp-transaction.create',
    },
  ],
}
