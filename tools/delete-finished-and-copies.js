(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { LOG_DIR, DOCUMENT_DIR } = require('../config')
  const { rmSync, mkdirSync, existsSync, appendFileSync } = require('fs')

  const today = new Date()
  const month = today.getMonth() + 1 > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`
  const logName = `${today.getFullYear()} - ${month}`

  const localLogger = (entry) => {
    console.log(entry)
    if (LOG_DIR) {
      appendFileSync(`${LOG_DIR}/${logName} - delete.log`, `${entry}\n`)
    }
  }
  logConfig({
    localLogger
  })
  logger('info', ['new run - deleting finished files'])
  try {
    rmSync(`./${DOCUMENT_DIR}/finished`, { force: true, recursive: true })
  } catch (error) {
    console.log(error)
    await logger('error', 'oi, klarte ikke slette filene....')
    if (!existsSync(`./${DOCUMENT_DIR}/finished`)) mkdirSync(`./${DOCUMENT_DIR}/finished`)
    process.exit(1)
  }
  if (!existsSync(`./${DOCUMENT_DIR}/finished`)) mkdirSync(`./${DOCUMENT_DIR}/finished`)
  logger('info', ['done deleting finished files'])

  logger('info', ['new run - deleting copied files'])
  try {
    rmSync(`./${DOCUMENT_DIR}/copies`, { force: true, recursive: true })
  } catch (error) {
    console.log(error)
    await logger('error', 'oi, klarte ikke slette filene....')
    if (!existsSync(`./${DOCUMENT_DIR}/copies`)) mkdirSync(`./${DOCUMENT_DIR}/copies`)
    process.exit(1)
  }
  if (!existsSync(`./${DOCUMENT_DIR}/copies`)) mkdirSync(`./${DOCUMENT_DIR}/copies`)
  logger('info', ['done deleting copied files'])
})()
