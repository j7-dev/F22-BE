module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/golf/transaction',
      handler: 'get-golf-transaction.main',
    },
    {
      method: 'POST',
      path: '/golf/transaction',
      handler: 'golf-transaction.create',
    },
  ],
}
