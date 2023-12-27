const { logger } = require('@vtfk/logger')
const { DELETE_FINISHED_AFTER_DAYS } = require('../config')
const { readdirSync, unlinkSync } = require('fs')

const deleteFinishedDocuments = () => {
  {
    logger('info', ['deleteFinishedDocuments', `Deleting ${DELETE_FINISHED_AFTER_DAYS} days old documents from documents/finished`])
    const dir = './documents/finished'
    const finishedDocs = readdirSync(dir).filter(doc => doc.endsWith('.json'))
    const now = new Date()
    const report = {
      deletedDocs: 0,
      ignoredDocs: 0
    }
    for (const document of finishedDocs) {
      const { flowStatus: { createdTimestamp, createPdf } } = require(`.${dir}/${document}`)
      const daysOld = Math.floor((now - new Date(createdTimestamp)) / (1000 * 60 * 60 * 24)) // No worries with daylightsavings here :) We can live with a day fra eller til
      if (daysOld > Number(DELETE_FINISHED_AFTER_DAYS)) {
        logger('info', ['deleteFinishedDocuments', `${document} is ${daysOld} days old, which is above timelimit for deletion: ${DELETE_FINISHED_AFTER_DAYS}, deleting.`])
        try {
          unlinkSync(`${dir}/${document}`)
          if (createPdf?.finished) {
            unlinkSync(`${dir}/${createPdf.result.filename}`)
          }
          report.deletedDocs++
        } catch (error) {
          logger('warn', ['deleteFinishedDocuments', `What, ${document} avoided deletion! It will live to see another day (but probably not for long)`, error.stack || error.toString()])
        }
      } else {
        report.ignoredDocs++
      }
    }
    logger('info', ['deleteFinishedDocuments', `finished deleting documents. ${report.deletedDocs} docs was deleted. ${report.ignoredDocs} was ignored.`])
  }
  {
    logger('info', ['deleteCopiedDocuments', `Deleting ${DELETE_FINISHED_AFTER_DAYS} days old documents from documents/copies`])
    const dir = './documents/copies'
    const copiedDocs = readdirSync(dir)
    const now = new Date()
    const report = {
      deletedDocs: 0,
      ignoredDocs: 0
    }
    for (const document of copiedDocs) {
      const { created: { timestamp } } = require(`.${dir}/${document}`)
      const daysOld = Math.floor((now - new Date(timestamp)) / (1000 * 60 * 60 * 24)) // No worries with daylightsavings here :) We can live with a day fra eller til
      if (daysOld > Number(DELETE_FINISHED_AFTER_DAYS)) {
        logger('info', ['deleteCopiedDocuments', `${document} is ${daysOld} days old, which is above timelimit for deletion: ${DELETE_FINISHED_AFTER_DAYS}, deleting.`])
        try {
          unlinkSync(`${dir}/${document}`)
          report.deletedDocs++
        } catch (error) {
          logger('warn', ['deleteCopiedDocuments', `What, ${document} avoided deletion! It will live to see another day (but probably not for long)`, error.stack || error.toString()])
        }
      } else {
        report.ignoredDocs++
      }
    }
    logger('info', ['deleteCopiedDocuments', `finished deleting documents. ${report.deletedDocs} docs was deleted. ${report.ignoredDocs} was ignored.`])
  }
}

module.exports = { deleteFinishedDocuments }
