
const axios = require('axios').default
const { archive, DOCUMENT_DIR } = require('../config')
const { logger } = require('@vtfk/logger')
const canSendOnSvarut = require('../lib/can-send-on-svarut')
const { writeFileSync } = require('fs')

/*
- Hvis eleven er under 18, og minst en forelder er funnet, og ingen adressegraderinger  send ut
- Hvis eleven er over 18, og ingen adressegradering send ut
- Hvis eleven er under 18, og vi ikke har noen foreldre, opprett intern notat og si fra til skolen at de må disturbere manuelt
- Hvis eleven eller foresatte har adresseperring, opprett internt notat og si fra til skolen at de må distribuere manuelt
- Hvis noen har en postadresse som ikke har 4 siffer i postnummer, opprett intertn notat og si fra til skolen at de må distribuere manuelt
- Hvis eleven finnes i unntaksregisteret (lokalt her), opprett internt og si fra til skolen at de må blabal

*/

const hasParents = (parents) => {
  if (parents.length > 0) return true
  return false
}

module.exports = async (jobDef, documentData) => {
  const headers = {
    'Ocp-Apim-Subscription-Key': archive.ARCHIVE_SUBSCRIPTION_KEY
  }
  /*
   Checks if
   - No receiver has address block
   - No receiver has wrong zipcode
   - No receiver has exception
   - If parents are missing when they should be added
  */
  const canSend = canSendOnSvarut(documentData)
  if (canSend.result) {
    logger('info', ['svarut', 'All is good - sending document on Svarut'])
    const payload = {
      service: 'DocumentService',
      method: 'DispatchDocuments',
      parameter: {
        Documents: [{
          DocumentNumber: documentData.flowStatus.archive.result.DocumentNumber
        }]
      }
    }
    const { data } = await axios.post(`${archive.ARCHIVE_URL}/archive`, payload, { headers })
    logger('info', ['svarut', 'Successfully sent document on svarut', data.DocumentNumber])
    return data
  }

  // Could not send on svarut - find cause and alert school
  // Set document to journalført, add internt notat from template "hemmelig"
  logger('info', ['svarut', 'Could not send document on Svarut. Setting original document to Journalfort and creating internal note.'])
  const payload = {
    service: 'DocumentService',
    method: 'UpdateDocument',
    parameter: {
      DocumentNumber: documentData.flowStatus.archive.result.DocumentNumber,
      Status: 'J'
    }
  }
  await axios.post(`${archive.ARCHIVE_URL}/archive`, payload, { headers })
  logger('info', ['svarut', 'Successfully set status to Journalfort', documentData.flowStatus.archive.result.DocumentNumber])

  if (canSend.reason === 'addressBlock' || canSend.reason === 'svarut exception' || canSend.reason === 'wrong zipCode') {
    // Create new document in queue with needed data
    logger('info', ['svarut', 'creating new document in queue for internal note "hemmelig" handling'])
    const secretDocument = {
      _id: `${documentData._id}_hemmelig`,
      created: documentData.created,
      type: documentData.type,
      variant: 'hemmelig',
      originalVariant: documentData.variant,
      elevmappe: documentData.flowStatus.syncElevmappe.result.elevmappe,
      school: documentData.school,
      teacher: documentData.teacher,
      student: documentData.student
    }

    const filepath = `./${DOCUMENT_DIR}/queue/${documentData._id}_hemmelig.json`
    writeFileSync(filepath, JSON.stringify(secretDocument, null, 2))
    return { reason: canSend.reason, filepath }
  }
  
  if (canSend.reason === 'parents not found') {
    logger('info', ['svarut', 'creating new document in queue for internal note "foresatte" handling'])
    const parentDocument = {
      _id: `${documentData._id}_foresatte`,
      created: documentData.created,
      type: documentData.type,
      variant: 'foresatte',
      originalVariant: documentData.variant,
      elevmappe: documentData.flowStatus.syncElevmappe.result.elevmappe,
      school: documentData.school,
      teacher: documentData.teacher,
      student: documentData.student
    }

    const filepath = `./${DOCUMENT_DIR}/queue/${documentData._id}_foresatte.json`
    writeFileSync(filepath, JSON.stringify(parentDocument, null, 2))
    return { reason: canSend.reason, filepath }
  }

  throw new Error(`Can send reason "${canSend.reason}" cannot be handled...`)

}
