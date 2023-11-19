'use strict'

const daily = require('./daily')
const recent = require('./recent')
const important = require('./important')
const agentDaily = require('./agentDaily')
const today = require('./today')

module.exports = ({ strapi }) => ({
  daily,
  recent,
  important,
  agentDaily,
  today,
})
