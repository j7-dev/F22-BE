module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/codepay/deposit',
      handler: 'codepay.deposit',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
