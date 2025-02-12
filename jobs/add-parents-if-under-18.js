const { logger } = require('@vtfk/logger')
const { callArchive } = require('../lib/call-archive')
const hasSvarutException = require('../lib/has-svarut-exception')

module.exports = async (jobDef, documentData) => {
  if (!documentData.flowStatus?.freg?.result) {
    throw new Error('Job "freg" must be run before you can run job "syncParents"')
  }
  if (!documentData.flowStatus?.syncElevmappe?.result) {
    throw new Error('Job "syncElevmappe" must be run before you can run job "syncParents"')
  }
  // Sjekk om adressesperring, returner tom liste hvis det er det
  if (hasSvarutException(documentData.flowStatus.freg.result.foedselsEllerDNummer) || hasSvarutException(documentData.student.personalIdNumber) || documentData.flowStatus.syncElevmappe.result.privatePerson.addressProtection) {
    logger('info', ['addParentsIfUnder18', 'Student has svarut exception or address block, will not sync parents'])
    return []
  }

  if (!documentData.flowStatus?.freg?.result?.foreldreansvar) {
    throw new Error('Could not find array "foreldreansvar" on freg result, something is wrong...')
  }
  const parents = documentData.flowStatus.freg.result.foreldreansvar.filter(parent => parent.erGjeldende && parent.ansvar !== 'ukjent' && ((parent.ansvarligUtenIdentifikator && parent.ansvarlig) || !parent.ansvarligUtenIdentifikator))

  if (documentData.flowStatus.freg.result.alder >= 18) {
    logger('info', ['addParentsIfUnder18', 'Student is over 18, will not sync parents'])
    return []
  }

  if (parents.length === 0) {
    logger('info', ['addParentsIfUnder18', 'No parents registered on student, cannot sync parents when they do not exist...'])
    return []
  }
  logger('info', ['addParentsIfUnder18', `Student is under 18, and have ${parents.length} parents registered. Will sync parents in archive`])
  const result = []
  const parentsToSync = []
  for (const parent of parents) {
    if (!parent.ansvarlig) throw new Error('Parent object does not have ansvarlig ssn on it - something is wrong')
    if (!parentsToSync.includes(parent.ansvarlig) && parent.ansvarlig.length === 11 && !isNaN(parent.ansvarlig)) parentsToSync.push(parent.ansvarlig) // Check that ansvarlig is "ssn", can be "ukjent" Add parents ssn to list parentsToSync (to not get duplicates, just in case)
  }

  for (const parentSsn of parentsToSync) {
    const data = await callArchive('SyncPrivatePerson', { ssn: parentSsn })
    result.push(data)
  }
  logger('info', ['addParentsIfUnder18', `Successfully synced ${parentsToSync.length} parents.`])

  return result
}
