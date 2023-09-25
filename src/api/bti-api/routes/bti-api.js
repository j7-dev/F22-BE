module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/bti-api/validatetoken',
      handler: 'validatetoken.validatetoken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bti-api/reserve',
      handler: 'reserve.reserve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/bti-api/cancelreserve',
      handler: 'cancelreserve.cancelreserve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bti-api/debitreserve',
      handler: 'debitreserve.debitreserve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/bti-api/commitreserve',
      handler: 'commitreserve.commitreserve',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bti-api/creditcustomer',
      handler: 'creditcustomer.creditcustomer',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bti-api/debitcustomer',
      handler: 'debitcustomer.debitcustomer',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}
