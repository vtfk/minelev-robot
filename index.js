(async () => {
  // Process.exit when stuff crashes
  // Remember to close mongoclient when script is done

  const robot = require('./robot/index')
  const { logger, logConfig } = require('@vtfk/logger')
  const { getReadyDocuments } = require('./robot/get-ready-documents')
  const { disconnect } = require('./lib/mongo-client')
  const { createLocalLogger } = require('./lib/local-logger')
  const { existsSync, mkdirSync } = require('fs')
  const { deleteFinishedDocuments } = require('./tools/delete-finished-documents')

  // Set up logging
  logConfig({
    teams: {
      onlyInProd: false
    },
    localLogger: createLocalLogger('minelev-robot')
  })

  logger('info', ['---------- NEW RUN ----------'])

  // Make sure directories are setup correct
  const syncDir = (dir) => {
    if (!existsSync(dir)) {
      logger('info', [`${dir} folder does not exist, creating...`])
      mkdirSync(dir)
    }
  }
  // Setup document-dirs
  syncDir('./documents')
  syncDir('./documents/queue')
  syncDir('./documents/failed')
  syncDir('./documents/finished')
  syncDir('./documents/copies')

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

  try {
    deleteFinishedDocuments()
  } catch (error) {
    logger('error', ['Error when deleting finished documents', error.stack || error.toString()])
  }

  await disconnect()
  await logger('info', ['finished run'])
})()
