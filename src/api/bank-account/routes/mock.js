module.exports = {
  routes: [
    {
      // Path defined with an URL parameter
      method: 'POST',
      path: '/bank-account/mock',
      handler: 'mock.main',
    },
  ],
}
