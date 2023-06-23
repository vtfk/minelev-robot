
const axios = require('axios').default
const { archive } = require('../config')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['syncPrivatePerson', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['syncPrivatePerson', 'Mapper is defined in options. Will use it.'])
  const personData = mapper(documentData)
  const headers = {
    // Til fremtiden: lag en funksjon som henter AzureAD token og legger i header
    'Ocp-Apim-Subscription-Key': archive.ARCHIVE_SUBSCRIPTION_KEY
  }

  let payload

  if (personData.skipDSF) {
    logger('info', ['syncPrivatePerson', 'Synching private person with skipDSF'])
    const { skipDSF, ssn, firstName, lastName, streetAddress, zipCode, zipPlace } = personData
    if (!(skipDSF && ssn && firstName && lastName && streetAddress && zipCode && zipPlace)) {
      throw new Error('missing required parameters. Must be skipDSF, ssn, firstName, lastName, streetAddress, zipCode, zipPlace')
    }
    payload = {
      ssn,
      firstName,
      lastName,
      streetAddress,
      zipCode,
      zipPlace,
      addressCode: 0,
      skipDSF
    }
  }

  if (!personData.skipDSF) {
    logger('info', ['syncPrivatePerson', 'Synching private person'])
    const { ssn } = personData
    if (!ssn) {
      throw new Error('missing required parameters. Must have ssn')
    }
    payload = {
      ssn
    }
  }
  const { data } = await axios.post(`${archive.ARCHIVE_URL}/SyncPrivatePerson`, payload, { headers })
  logger('info', ['syncPrivatePerson', 'Successfully synched private person', 'RecNo', data.privatePerson.recno])
  return data
}
