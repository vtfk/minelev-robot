const axios = require('axios').default
const { KRR } = require('../config')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['krr', 'No mapper defined in options'])
    throw new Error('No mapper defined in options for krr. Please provide a custom mapper in flow definition')
  }
  logger('info', ['krr', 'Mapper is defined in options. Will use it.'])
  const { ssn } = mapper(documentData)
  if (!ssn) throw new Error('Mapper did not return property "ssn", please make sure it does...')
  const { data } = await axios.post(KRR.URL, [ssn], { headers: { 'x-functions-key': KRR.KEY } })
  if (data.personer && Array.isArray(data.personer) && data.personer.length === 1) {
    logger('info', ['krr', 'Found person in krr'])
    const person = data.personer[0]
    return person
  } else if (data.personer && Array.isArray(data.personer) && data.personer.length > 1) {
    logger('warn', ['krr', 'Found several persons on same ssn in krr, what?? Returning null'])
    return null
  } else {
    logger('warn', ['krr', 'Could not find person in KRR, returning null'])
    return null
  }
}
