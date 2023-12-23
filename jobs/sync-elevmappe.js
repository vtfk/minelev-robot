const { logger } = require('@vtfk/logger')
const { callArchive } = require('../lib/call-archive')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['syncElevmappe', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['syncElevmappe', 'Mapper is defined in options. Will use it.'])
  const personData = mapper(documentData)

  logger('info', ['syncElevmappe', 'Synching elevmappe'])
  const { ssn } = personData
  if (!ssn) {
    throw new Error('Missing required parameters. Must have ssn')
  }

  try {
    const payload = { ssn }
    const data = await callArchive('SyncElevmappe', payload)
    logger('info', ['syncElevmappe', 'Successfully synched elevmappe', 'privatePerson recNo', data.privatePerson.recno, 'elevmappe saksnummer', data.elevmappe.CaseNumber])
    return data
  } catch (error) {
    if (error.response?.data && typeof error.response.data.message === 'string' && error.response.data.message.startsWith('Error: Could not find anyone with that ssn')) { // Not found in dsf - probably exchange student, overriding with dummy data
      logger('info', ['syncElevmappe', 'Could not find person in FREG, will try to sync with manual data'])
      const payload = {
        ssn,
        firstName: documentData.student.firstName,
        lastName: documentData.student.lastName,
        streetAddress: 'Ukjent adresse',
        zipCode: '9999', // 9999 UKJENT will trigger invalidZip in can-send-on-svarut.js, and will trigger internal note to school if should be sent on svarut
        zipPlace: 'UKJENT',
        manualData: true
      }
      const data = await callArchive('SyncElevmappe', payload)
      logger('info', ['syncElevmappe', 'Successfully synched elevmappe with manual data', 'privatePerson recNo', data.privatePerson.recno, 'elevmappe saksnummer', data.elevmappe.CaseNumber])
      return data
    }
    throw error
  }
}
