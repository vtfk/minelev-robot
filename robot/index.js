const { readdirSync } = require('fs')
const { DOCUMENT_DIR } = require('../config')
const { logger, logConfig } = require('@vtfk/logger')
const { handleDocument } = require('./handle-document')

const readyForRetry = (file) => {
  if (!file.includes('_nextrun_')) return true
  const nextRun = new Date(file.split('_nextrun_').pop().replace('.json', '').replaceAll('--', ':')) // Get the nextrun-timestamp by splitting on "_nextrun_" and fetching the last element (which is the "{timestamp for the next run}.json", remove ".json", replace "--" with ":" to get a valid ISOstring, and then convert to Date Object. Nice.
  if (new Date() >= nextRun) return true
  logger('info', [file, 'Not ready for retry', 'next run', nextRun.toISOString()])
  return false
}

// Get all documents in queue - try to handle each of them
const robot = async () => {
  const readyDocuments = readdirSync(`${DOCUMENT_DIR}/queue`).filter(file => { return file.endsWith('.json') && !file.endsWith('_pdf.json') && readyForRetry(file) })
  logger('info', ['saksbehandler', `${readyDocuments.length} documents ready for handling`])

  // retry handling here - maybe controlled by filename - makes it more efficient :)

  // Only loop through ready documents
  for (const document of readyDocuments) {
    logConfig({ prefix: false })
    logger('info', ['saksbehandler', `Handling document ${document}`])
    try {
      await handleDocument(document)
    } catch (error) {
      // Setting retry and stuff is handled by handleDocument
      logger('error', [`Error on document ${document}, something is very wrong...`, error.stack || error.toString()])
      continue
    }
  }
}

module.exports = robot
