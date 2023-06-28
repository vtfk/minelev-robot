(async () => {
  // Process.exit when stuff crashes
  // Remember to close mongoclient when script is done

  const robot = require('./robot/index')
  const { logger, logConfig } = require('@vtfk/logger')
  const { getReadyDocuments } = require('./robot/get-ready-documents')
  const { disconnect } = require('./lib/mongo-client')

  logger('info', ['new run'])

  try {
    await getReadyDocuments()
  } catch (error) {
    logger('error', ['Error when fetching documents from mongodb', error.stack || error.toString()])
  }

  try {
    await robot()
  } catch (error) {
    logger('error', ['Error when running robot', error.stack || error.toString()])
  }

  logConfig({
    prefix: false
  })
  await disconnect()
  await logger('info', ['finished run'])
})()
