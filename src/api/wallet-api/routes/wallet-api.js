module.exports = {
  routes: [
    {
      method: "POST",
      path: "/wallet-api/add",
      handler: "add.add",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/wallet-api/deduct",
      handler: "deduct.deduct",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/wallet-api/balance",
      handler: "balance.balance",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/wallet-api/updateBalance",
      handler: "updateBalance.updateBalance",
      config: {
        policies: [],
        middlewares: [],
      }
    }
  ]
};
