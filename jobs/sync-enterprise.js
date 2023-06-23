
const axios = require('axios').default
const { archive } = require('../config')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['syncEnterprise', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['syncEnterprise', 'Mapper is defined in options. Will use it.'])
  const { enterpriseNumber } = mapper(documentData)

  if (!enterpriseNumber) throw new Error('Mapper must return property "enterpriseNumber"')

  const headers = {
    // Til fremtiden: lag en funksjon som henter AzureAD token og legger i header
    'Ocp-Apim-Subscription-Key': archive.ARCHIVE_SUBSCRIPTION_KEY
  }

  const { data } = await axios.post(`${archive.ARCHIVE_URL}/SyncEnterprise`, { orgnr: enterpriseNumber }, { headers })
  logger('info', ['syncEnterprise', 'Successfully synched enterprise', 'RecNo', data.result.enterprise.recno])
  return data
}
