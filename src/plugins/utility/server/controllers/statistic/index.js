'use strict'

const daily = require('./daily')
const recent = require('./recent')
const important = require('./important')
const agent = require('./agent')
const byReferral = require('./by-referral')

const today = require('./today')

module.exports = ({ strapi }) => ({
  daily,
  recent,
  important,
  agent,
  byReferral,
  today,
})