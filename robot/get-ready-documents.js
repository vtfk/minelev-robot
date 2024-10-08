const { logger } = require('@vtfk/logger')
const { connect } = require('../lib/mongo-client')
const { MONGODB, DOCUMENTS_PER_RUN, COUNTY_NUMBER } = require('../config')
const { writeFileSync, renameSync } = require('fs')

const getReadyDocuments = async () => {
  try {
    if (!COUNTY_NUMBER) throw new Error('No COUNTY_NUMBER, did you forget to set it in .env?')
    const mongoClient = await connect()
    logger('info', ['queue', 'get next document in queue'])
    const collection = mongoClient.db(MONGODB.DB).collection(MONGODB.COLLECTION)
    const documents = await collection.find({ isQueued: true }).sort({ timestamp: 1 }).limit(DOCUMENTS_PER_RUN).toArray() // Get documents and ready
    logger('info', ['queue', `got ${documents.length} documents from queue`, documents.length === 0 ? 'No new documents' : 'Saving documents to local files'])

    for (const document of documents) {
      logger('info', ['queue', `Saving document ${document._id} to queue dir`])
      try {
        writeFileSync(`./documents/queue/${document._id}.json`, JSON.stringify(document, null, 2))
      } catch (error) {
        logger('error', ['queue', `Could not save ${document._id} to file, will retry next run`, error.stack])
        continue
      }
      logger('info', ['queue', `Saving document ${document._id} to queue copies`])
      try {
        writeFileSync(`./documents/copies/${document._id}.json`, JSON.stringify(document, null, 2))
      } catch (error) {
        logger('error', ['queue', `Could not save ${document._id} to copies...`, error.stack])
        continue
      }

      // If we have variant "bekreftelse", we create an additional document {_id}_bekreftelse, and save it to both queue and queue/copies - to handle yff-bekreftelse
      if (document.variant === 'bekreftelse') {
        logger('info', ['queue', `Found variant bekreftelse on ${document._id}. Creating additional document ${document._id}_bekreftelse, with variant "bekreftelse-bedrift"`])
        const newDocument = { ...document, _id: `${document._id}_bekreftelse`, variant: 'bekreftelse-bedrift' }
        logger('info', ['queue', `Saving document ${document._id} to queue dir`])
        try {
          writeFileSync(`./documents/queue/${newDocument._id}.json`, JSON.stringify(newDocument, null, 2))
        } catch (error) {
          logger('error', ['queue', `Could not save ${document._id} to file, moving original to failed and continuing. Will try again next run.`, error.stack])
          renameSync(`./documents/queue/${document._id}.json`, `./documents/queue/failed/${document._id}.json`)
          continue
        }
        logger('info', ['queue', `Saving document ${newDocument._id} to queue copies`])
        try {
          writeFileSync(`./documents/copies/${newDocument._id}.json`, JSON.stringify(newDocument, null, 2))
        } catch (error) {
          logger('error', ['queue', `Could not save ${newDocument._id} to copies...`, error.stack])
          continue
        }
        logger('info', ['queue', `Successfully created and saved ${newDocument._id}"`])
      }

      logger('info', ['queue', `Setting status for ${document._id} to not queued in mongodb`])
      try {
        await collection.updateOne({ _id: document._id }, { $set: { isQueued: false } })
        logger('info', ['queue', `Status for ${document._id} set to not queued in mongodb`])
      } catch (error) {
        logger('error', ['queue', `Could set status for ${document._id} to not queued. Moving file to failed folder. Will try again next run.`, error.stack])
        renameSync(`./documents/queue/${document._id}.json`, `./documents/queue/failed/${document._id}.json`)
        continue
      }
    }
  } catch (error) {
    logger('error', ['queue', 'error', error])
  }
}

// Local testing
/*
(async () => {
  await getReadyDocuments()
})()
*/

module.exports = { getReadyDocuments }
