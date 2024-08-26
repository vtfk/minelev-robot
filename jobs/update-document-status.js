const { logger } = require('@vtfk/logger')
const { connect } = require('../lib/mongo-client')
const { MONGODB } = require('../config')
const { ObjectId } = require('mongodb')

/*
Ulike statuser som skal oppdateres:
Notat
  queued (er der fra før av)
  archived (når dokumentet er arkivert)

Samtale
  queued (er der fra før av)
  archived (når dokumentet er arkivert)

ikke-samtale
  queued (er der fra før av)
  archived (når dokumentet er arkivert)
  sent (svarut)

Varsel fag og orden
  queued (er der fra før av)
  archived (når dokumentet er arkivert)
  sent (svarut)

YFF bekreftelse
  queued (er der fra før av)
  archived (når dokumentet er arkivert)
  sent (svarut)
  archived (bekreftelse)
  sent (bekreftelse)

YFF tilbakemelding
  queued (er der fra før av)
  archived (når dokumentet er arkivert)
  sent (svarut)

YFF laereplan
  queued (er der fra før av)
  archived (når dokumentet er arkivert)
  sent (svarut)
*/

module.exports = async (jobDef, documentData) => {
  const statuses = []
  if (documentData.flowStatus?.archive?.finished) {
    logger('info', ['updateDocumentStatus', 'Document is archived, setting status "archived"'])
    statuses.push({
      status: 'archived',
      message: documentData.flowStatus.archive?.result?.DocumentNumber || null,
      timestamp: documentData.flowStatus.archive.finishedTimestamp
    })
  }
  if (documentData.flowStatus?.svarut?.finished) {
    logger('info', ['updateDocumentStatus', 'Document is sent on svarut, setting status "sent"'])
    statuses.push({
      status: 'sent',
      timestamp: documentData.flowStatus.svarut.finishedTimestamp
    })
  }

  const mongoClient = await connect()
  const collection = mongoClient.db(MONGODB.DB).collection(MONGODB.COLLECTION)
  // Sjekk om det er en bekreftelse_bedrift - i så fall skal det dyttes til originaldokumentet i mongodb, og ikke {_id}_bekreftelse (altså bare til ${_id})
  const result = await collection.updateOne({ _id: new ObjectId(documentData._id.replace('_bekreftelse', '')) }, { $push: { status: { $each: statuses } } }) // Lagre timestamp for fullførte jobber? Lagre alle statuser på en gang like greit?? Neh, vi gjør det, det var lett
  if (result.matchedCount !== 1) throw new Error('OIOIOI, her var det ikke match på et entydig document i MongoDB - ta en sjekk')
  logger('info', ['updateDocumentStatus', 'Status successfully set'])
  return result
}
