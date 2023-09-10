module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/evo/transaction',
      handler: 'get-evo-transaction.main',
    },
    {
      method: 'POST',
      path: '/evo/transaction',
      handler: 'evo-transaction.create',
    },
    {
      method: 'PUT',
      path: '/evo/transaction',
      handler: 'update-evo-transaction.main',
    },
  ],
}
