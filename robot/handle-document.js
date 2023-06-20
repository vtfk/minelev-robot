const { logger, logConfig } = require('@vtfk/logger')
const { DOCUMENT_DIR, ENCRYPTION_KEY, RETRY_INTERVAL_MINUTES } = require('../config')
const { decryptContent } = require('@vtfk/encryption')
const { renameSync, writeFileSync } = require('fs')

// Import jobs
const krr = require('../jobs/krr')
const freg = require('../jobs/freg')
const syncElevmappe = require('../jobs/syncElevmappe')
const syncPrivatePerson = require('../jobs/syncPrivatePerson')
const syncParents = require('../jobs/syncParents')
const syncEnterprise = require('../jobs/syncEnterprise')
const createPdf = require('../jobs/createPdf')

/*
Trenger følgende jobber:
- krr sjekk (hvilket språk de foretrekker, goddammit...)
- freg sjekk
-   Kan de over slås sammen i azf-archive mon tro? Njæh, kjør heller krr sjekk manuelt (det er vel bare for foretrukket språk?)
- sjekk etter adressesperring og pass på at det blir riktig!
- sjekk om man har en gyldig postadresse / svarut-godkjent (postnr korrekt)
- lag pdf via pdf-generator (tror vi driter i å opprette automatisk i azf-archive, for ressurskrevende der...)
- arkiver dokument
- send ut om det skal sendes ut. (Om det er adressesperring må det gå internt notat til skolen for oppfølging)
- Send ut varsel på e-post til de som trenger det
- Hold track på flyten, lagre ulike jobber sin status i json-fila. Ta en av gangen, arkiv-endepunktet er så treigt allikevel
- Hva er greia med yff-tilbakemld?? Ikke sikkert vi trenger gjøre noe annet enn å følge flyten på den altså
- Om vi har den dataen vi trenger, så blir det jo ikke så galt :D


.then(prepareDocument)
      .then(lookupKrr) // Ferdig
      .then(lookupDsf) // Ferdig
      .then(filterSecretAddress) // Vi har info om grader adresse om vi trenger i freg
      .then(setupDistribution) // Vi har adresser til foreldre og elev
      .then(lookup360) // Vi har sikret at privatpersoner og elevmappe er opprettet i 360 (vi gidder ikke sjekke hemmelig adresse i 360)
      .then(checkSecretAddress) // Vi har adresser allerede
      .then(gotAddressForDistribution) // Vi har adresser allerede
      .then(setupDocuments) // Vi må nå, lage pdf-er
      .then(setupArchive)
      .then(saveToDone)
      .then(saveToNotifications)
      .then(saveToArchive)
      .then(saveToDistribution)
      .then(saveToErrors)
      .then(removeFromQueue)
      .then(data => {
        return resolve(data)
      })
*/

const setUpJob = (flow, jobName, documentData) => {
  if (flow[jobName]?.enabled) {
    if (!documentData.flowStatus[jobName]) documentData.flowStatus[jobName] = { finished: false }
  }
  return documentData.flowStatus
}

const shouldRunJob = (flow, jobName, documentData) => {
  // Check if flow has already failed or jobStatus is not already finished and if it is enabled in the flow for the document type
  if (!documentData.flowStatus.failed && !documentData.flowStatus[jobName]?.finished && flow[jobName]?.enabled) return true
  return false
}

const handleFailedJob = (jobName, documentData, document, error) => {
  // If has run too many times - do something
  documentData.flowStatus.runs++ // It ran one more time, increase runs

  // Handle error msg
  const errorMsg = error.response?.data || error.stack || error.toString()
  documentData.flowStatus[jobName].error = errorMsg

  if (documentData.flowStatus.runs >= RETRY_INTERVAL_MINUTES.length) {
    logger('error', ['Job failed, will NOT run again', `Failed in job: ${jobName}`, `Runs: ${documentData.flowStatus.runs}/${RETRY_INTERVAL_MINUTES.length}. Reset flowStatus.runs to try again`, 'error:', errorMsg])
    try {
      writeFileSync(`./${DOCUMENT_DIR}/queue/${document}`, JSON.stringify(documentData, null, 2))
      renameSync(`./${DOCUMENT_DIR}/queue/${document}`, `./${DOCUMENT_DIR}/failed/${document}`)
    } catch (error) {
      logger('error', ['Offh, could not save and move file, stuff might run twice...', `Failed in job: ${jobName}`, 'Probs smart to check it out when you have the time', 'save-error:', error])
    }
    return documentData
  }

  // Still some retries left
  const minutesToWait = RETRY_INTERVAL_MINUTES[documentData.flowStatus.runs]
  const now = new Date()
  const nextRun = new Date(now.setMinutes(now.getMinutes() + minutesToWait)).toISOString().replaceAll(':', '--') // Filenames can't contain :
  logger('warn', [`Job failed, will try again in ${RETRY_INTERVAL_MINUTES[documentData.flowStatus.runs]} minutes`, `Failed in job: ${jobName}`, `Runs: ${documentData.flowStatus.runs}/${RETRY_INTERVAL_MINUTES.length}`, 'error:', errorMsg])
  try {
    writeFileSync(`./${DOCUMENT_DIR}/queue/${document}`, JSON.stringify(documentData, null, 2)) // Save status
    renameSync(`./${DOCUMENT_DIR}/queue/${document}`, `./${DOCUMENT_DIR}/queue/${documentData._id}_nextrun_${nextRun}.json`) // Rename file with new retry timestamp
  } catch (error) {
    logger('error', ['Offh, could not save file with new status, stuff might run twice...', `Failed in job: ${jobName}`, 'Probs smart to check it out when you have the time', 'save-error:', error])
  }
  return documentData
}

const runJob = async (document, flow, jobName, documentData, jobFunction) => {
  documentData.flowStatus = setUpJob(flow, jobName, documentData)
  if (shouldRunJob(flow, jobName, documentData)) {
    logger('info', ['running job', jobName, 'type', documentData.type, 'variant', documentData.variant, 'student', documentData.student.username])
    try {
      documentData.flowStatus[jobName].result = await jobFunction(flow[jobName], documentData)
      documentData.flowStatus[jobName].finished = true
      logger('info', ['finished job', jobName, 'type', documentData.type, 'variant', documentData.variant, 'student', documentData.student.username])
    } catch (error) {
      documentData.flowStatus.failed = true
      handleFailedJob(jobName, documentData, document, error)
    }
  }
  return documentData.flowStatus
}

// "document" is the filename
const handleDocument = async (document) => {
  const documentData = require(`../${DOCUMENT_DIR}/queue/${document}`)
  logConfig({ prefix: `handle-document - ${documentData._id}` })

  // Get flow for document
  let flow
  try {
    flow = require(`../flows/${documentData.type}-${documentData.variant}`)
  } catch (error) {
    throw new Error(`Aiaiai, mangler flow-fil for ${documentData.type}-${documentData.variant}`)
  }
  
  // Set up flowStatus if missing
  if (!documentData.flowStatus) documentData.flowStatus = { runs: 0 }
  // New run, reset failed
  documentData.flowStatus.failed = false
  
  // Check if content is encrypted, and decrypt if necessary
  if (documentData.isEncrypted) {
    logger('info', ['Content is encrypted. Decrypting.'])
    const decrypted = await decryptContent(documentData.content, ENCRYPTION_KEY)
    documentData.content = decrypted
    documentData.isEncrypted = false
  }

  // KRR check
  documentData.flowStatus = await runJob(document, flow, 'krr', documentData, krr)

  // KRR check
  documentData.flowStatus = await runJob(document, flow, 'freg', documentData, freg)
  
  // SyncElevmappe
  documentData.flowStatus = await runJob(document, flow, 'syncElevmappe', documentData, syncElevmappe)

  // SyncParents
  documentData.flowStatus = await runJob(document, flow, 'syncParents', documentData, syncParents)

  // SyncEnterprise
  documentData.flowStatus = await runJob(document, flow, 'syncEnterprise', documentData, syncEnterprise)

  // Create PDF
  documentData.flowStatus = await runJob(document, flow, 'createPdf', documentData, createPdf)

  // Fail on purpose
  documentData.flowStatus = await runJob(document, flow, 'failOnPurpose', documentData, async () => { throw new Error('Æ feilja med vilje') })

}

module.exports = { handleDocument }