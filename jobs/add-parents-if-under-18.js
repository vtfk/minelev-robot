
const axios = require('axios').default
const { archive } = require('../config')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  if (!documentData.flowStatus?.freg?.result) {
    throw new Error('Job "freg" must be run before you can run job "syncParents"')
  }
  if (!documentData.flowStatus?.freg?.result?.foreldreansvar) {
    throw new Error('Could not find array "foreldreansvar" on freg result, something is wrong...')
  }
  const parents = documentData.flowStatus.freg.result.foreldreansvar

  if (documentData.flowStatus.freg.result.alder >= 18) {
    logger('info', 'Student is over 18, will not sync parents')
    return []
  }

  if (parents.length === 0) {
    logger('info', 'No parents registered on student, cannot sync parents when they do not exist...')
    return []
  }
  const result = []
  const parentsToSync = []
  for (const parent of parents) {
    if (!parent.ansvarlig) throw new Error('Parent object does not have ansvarlig ssn on it - something is wrong')
    if (!parentsToSync.includes(parent.ansvarlig)) parentsToSync.push(parent.ansvarlig) // Add parents ssn to list parentsToSync (to not get duplicates, just in case)
  }

  // Run syncPrivatePerson on each parent
  const headers = {
    // Til fremtiden: lag en funksjon som henter AzureAD token og legger i header
    'Ocp-Apim-Subscription-Key': archive.ARCHIVE_SUBSCRIPTION_KEY
  }

  for (const parentSsn of parentsToSync) {
    const { data } = await axios.post(`${archive.ARCHIVE_URL}/SyncPrivatePerson`, { ssn: parentSsn }, { headers })
    result.push(data)
  }

  return result
}
