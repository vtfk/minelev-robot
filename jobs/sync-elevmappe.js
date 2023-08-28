const axios = require('axios').default
const { archive } = require('../config')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['syncElevmappe', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['syncElevmappe', 'Mapper is defined in options. Will use it.'])
  const personData = mapper(documentData)

  const headers = {
    'Ocp-Apim-Subscription-Key': archive.ARCHIVE_SUBSCRIPTION_KEY
  }

  logger('info', ['syncElevmappe', 'Synching elevmappe'])
  const { ssn } = personData
  if (!ssn) {
    throw new Error('missing required parameters. Must have ssn')
  }

  try {
    const payload = { ssn }
    const { data } = await axios.post(`${archive.ARCHIVE_URL}/SyncElevmappe`, payload, { headers })
    logger('info', ['syncElevmappe', 'Successfully synched elevmappe', 'privatePerson recNo', data.privatePerson.recno, 'elevmappe saksnummer', data.elevmappe.CaseNumber])
    return data
  } catch (error) {
    if (error.response?.data?.error === 'Ingen funnet med angitt identifikasjon') { // Not found in dsf - probably exchange student, overriding with dummy data
      const payload = {
        ssn,
        firstName: documentData.student.firstName,
        lastName: documentData.student.lastName,
        streetAddress: 'Ukjent adresse',
        zipCode: '9999',
        zipPlace: 'UKJENT',
        addressCode: 0,
        skipDSF: true
      }
      const { data } = await axios.post(`${archive.ARCHIVE_URL}/SyncElevmappe`, payload, { headers })
      logger('info', ['syncElevmappe', 'Successfully synched elevmappe without DSF', 'privatePerson recNo', data.privatePerson.recno, 'elevmappe saksnummer', data.elevmappe.CaseNumber])
      return data
    }
    throw error
  }
}
