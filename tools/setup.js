(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { LOG_DIR, DOCUMENT_DIR } = require('../config')
  const { mkdirSync, existsSync, appendFileSync } = require('fs')

  if (!existsSync('./.env')) throw new Error('Please create .env with wanted values before running setup (see README)')

  const today = new Date()
  const month = today.getMonth() + 1 > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`
  const logName = `${today.getFullYear()} - ${month}`

  const localLogger = (entry) => {
    console.log(entry)
    if (LOG_DIR) {
      appendFileSync(`${LOG_DIR}/${logName} - setup.log`, `${entry}\n`)
    }
  }
  logConfig({
    localLogger
  })
  if (LOG_DIR) {
    const logPaths = LOG_DIR.split('/')
    let logPath = '.'
    for (const path of logPaths) {
      logPath += `/${path}`
      if (!existsSync(logPath)) {
        mkdirSync(logPath)
      }
    }
    logger('info', ['Successfully checked/set up log path'])
  }

  logger('info', ['Setting up document directories'])
  const docdirPath = DOCUMENT_DIR.split('/')
  let docPath = '.'
  for (const path of docdirPath) {
    docPath += `/${path}`
    if (!existsSync(docPath)) {
      logger('info', `dir "${docPath}" does not exist, creating...`)
      mkdirSync(docPath)
      logger('info', `dir "${docPath}" created`)
    } else {
      logger('info', `dir "${docPath}" already exist`)
    }
  }

  const dirs = ['queue', 'failed', 'finished', 'copies']
  for (const dir of dirs) {
    if (!existsSync(`./${DOCUMENT_DIR}/${dir}`)) {
      logger('info', `dir "./${DOCUMENT_DIR}/${dir}" does not exist, creating...`)
      mkdirSync(`./${DOCUMENT_DIR}/${dir}`)
      logger('info', `dir "./${DOCUMENT_DIR}/${dir}" created`)
    } else {
      logger('info', `dir "./${DOCUMENT_DIR}/${dir}" already exist`)
    }
  }
  logger('info', 'Setup completed successfully')
})()
