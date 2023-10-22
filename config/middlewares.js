module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: false,
      header: '*',
      origin: ['be-dev.smtbet7.com', 'smtbet7.com', 'www.w3schools.com'],
    },
  },
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::error-logger',
]
