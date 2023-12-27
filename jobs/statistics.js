const axios = require('axios').default
const { STATISTICS } = require('../config')
const { logger } = require('@vtfk/logger')
const { name, version } = require('../package.json')

module.exports = async (jobDef, documentData) => {
  const headers = {
    'x-functions-key': STATISTICS.KEY
  }
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['statistics', 'No mapper defined in options'])
    throw new Error('No mapper defined in options for statistics. Please provide a custom mapper in flow definition')
  }
  logger('info', ['statistics', 'Mapper is defined in options. Will use it.'])

  const payload = mapper(documentData)
  payload.system = 'MinElev'
  payload.engine = `${name} ${version}`
  payload.company = STATISTICS.COMPANY
  payload.department = documentData.school.name
  payload.externalId = documentData._id
  payload.type = `${documentData.type}-${documentData.variant}`
  payload.docType = documentData.type
  payload.variant = documentData.variant
  payload.school = documentData.school.name
  if (documentData.flowStatus?.archive?.result?.DocumentNumber) payload.documentNumber = documentData.flowStatus?.archive?.result?.DocumentNumber

  const { data } = await axios.post(`${STATISTICS.URL}/Stats`, payload, { headers })
  logger('info', ['statistics', 'Successfully made statistics', 'Object id', data.insertedId])
  return data
}
