(async () => {
  // Process.exit when stuff crashes
  // Remember to close mongoclient when script is done

  const robot = require('./robot/index')
  const { logger, logConfig } = require('@vtfk/logger')
  const { getReadyDocuments } = require('./robot/get-ready-documents')
  const { disconnect } = require('./lib/mongo-client')
  const { LOG_DIR } = require('./config')
  const { appendFileSync } = require('fs')

  const today = new Date()
  const month = today.getMonth() + 1 > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`
  const logName = `${today.getFullYear()} - ${month}`

  const localLogger = (entry) => {
    console.log(entry)
    if (LOG_DIR) {
      appendFileSync(`${LOG_DIR}/${logName}.log`, `${entry}\n`)
    }
  }
  logConfig({
    teams: {
      onlyInProd: false
    },
    localLogger
  })
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
