module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/wc/transaction',
      handler: 'transaction.create',
    },
    {
      method: 'GET',
      path: '/wc/transaction',
      handler: 'transaction.get',
    },
  ],
}
