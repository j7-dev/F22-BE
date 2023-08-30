module.exports = {
  routes: [
    {
      method: "POST",
      path: "/wallet-api/add",
      handler: "wallet-api.add",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/wallet-api/deduct",
      handler: "wallet-api.deduct",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/wallet-api/balance",
      handler: "wallet-api.balance",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
