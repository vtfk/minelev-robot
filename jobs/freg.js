const axios = require('axios').default
const { freg } = require('../config')
const { logger } = require('@vtfk/logger')
const graphToken = require('../lib/get-graph-token')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['freg', 'No mapper defined in options'])
    throw new Error('No mapper defined in options for freg. Please provide a custom mapper in flow definition')
  }
  logger('info', ['freg', 'Mapper is defined in options. Will use it.'])
  const { ssn } = mapper(documentData)
  const accessToken = await graphToken(freg.FREG_API_SCOPE, 'freg')
  const payload = {
    ssn,
    includeForeldreansvar: true
  }
  const { data } = await axios.post(freg.FREG_URL, payload, { headers: { Authorization: `Bearer ${accessToken}` } })
  logger('info', ['freg', 'Found person in freg'])
  return data
}
