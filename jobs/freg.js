const axios = require('axios').default
const { FREG } = require('../config')
const { logger } = require('@vtfk/logger')
const { getMsalToken } = require('../lib/get-msal-token')

const getAgeFromSsn = ssn => {
  const dayStr = ssn.substring(0, 2)
  const month = ssn.substring(2, 4)
  const yearStr = ssn.substring(4, 6)
  const day = Number(dayStr) > 40 ? (Number(dayStr) - 40).toString() : dayStr
  const year = Number(yearStr) < 40 ? `20${yearStr}` : `19${yearStr}` // remember to update this in 20 years
  const birthDate = `${year}-${month}-${day}`
  return getAge(birthDate)
}
const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['freg', 'No mapper defined in options'])
    throw new Error('No mapper defined in options for freg. Please provide a custom mapper in flow definition')
  }
  logger('info', ['freg', 'Mapper is defined in options. Will use it.'])
  const { ssn } = mapper(documentData)
  
  const authConfig = {
    clientId: APPREG.CLIENT_ID,
    tenantId: APPREG.TENANT_ID,
    clientSecret: APPREG.CLIENT_SECRET,
    scope: FREG.API_SCOPE
  }
  const accessToken = await getMsalToken(authConfig)
  
  const payload = {
    ssn,
    includeForeldreansvar: true
  }
  const { data } = await axios.post(freg.FREG_URL, payload, { headers: { Authorization: `Bearer ${accessToken}` } })
  // Check that ssn was found in freg
  if (!data.foedselsEllerDNummer) {
    logger('info', ['freg', 'Could not find person in freg, setting default fake data for freg'])
    // Create empty data - makes MinElev create internal note, that this should be handled manually by school
    const fakeData = {
      alder: getAgeFromSsn(documentData.student.personalIdNumber),
      foreldreansvar: []
    }
    return fakeData
  }
  logger('info', ['freg', 'Found person in freg'])
  return data
}
