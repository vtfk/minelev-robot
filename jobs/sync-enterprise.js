const { logger } = require('@vtfk/logger')
const { callArchive } = require('../lib/call-archive')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['syncEnterprise', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['syncEnterprise', 'Mapper is defined in options. Will use it.'])
  const { enterpriseNumber } = mapper(documentData)

  if (!enterpriseNumber) throw new Error('Mapper must return property "enterpriseNumber"')

  const data = await callArchive('SyncEnterprise', { orgnr: enterpriseNumber })
  logger('info', ['syncEnterprise', 'Successfully synched enterprise', 'RecNo', data.result.enterprise.recno])
  return data
}
