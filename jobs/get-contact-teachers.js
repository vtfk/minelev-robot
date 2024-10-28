const { APPREG, FINT_FOLK } = require('../config')
const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const { getMsalToken } = require('../lib/get-msal-token')

module.exports = async (jobDef, documentData) => {
  logger('info', ['getContactTeachers', 'Fetching contact teachers from FINTFOLK'])
  const studentFeidenavn = documentData.student?.feidenavn
  if (!studentFeidenavn) throw new Error('Must have "documentData.student.feidenavn" to be able to run job')
  const authConfig = {
    clientId: APPREG.CLIENT_ID,
    tenantId: APPREG.TENANT_ID,
    clientSecret: APPREG.CLIENT_SECRET,
    scope: FINT_FOLK.API_SCOPE
  }
  const accessToken = await getMsalToken(authConfig)

  const { data } = await axios.get(`${FINT_FOLK.URL}/student/feidenavn/${studentFeidenavn}`, { headers: { Authorization: `Bearer ${accessToken}` } })

  const contactTeachers = data.kontaktlarere
  if (!contactTeachers || !Array.isArray(contactTeachers)) throw new Error('No array property "kontaktlarere" found on returned student')

  logger('info', ['getContactTeachers', `Got ${contactTeachers.length} contact teachers from FINTFOLK`])
  return contactTeachers
}
