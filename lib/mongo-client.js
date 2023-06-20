const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { mongodb } = require('../config')

let client = null

const connect = async () => {
  if (client) {
    logger('info', ['mongo-client', 'Client already exists, quick return'])
    return client
  }

  client = new MongoClient(mongodb.MONGODB_CONNECTION_STRING)
  await client.connect()
  logger('info', ['mongo-client', 'Client created and connected'])
  return client
}

const disconnect = async () => {
  if (!client) return
  await client.close()
  logger('info', ['mongo-client', 'Client closed'])
  return
}

module.exports = { connect, disconnect }