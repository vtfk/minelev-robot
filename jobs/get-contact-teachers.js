const { pifu } = require('../config')
const generateJwt = require('../lib/generate-jwt')
const axios = require('axios').default
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const token = generateJwt(pifu.PIFU_JWT_SECRET)
  const studentUserName = documentData.student.username
  if (!studentUserName) throw new Error('Must have "documentData.student.username" to be able to run job')
  const url = `${pifu.PIFU_URL}/students/${studentUserName}/contactteachers`
  logger('info', ['getContactTeachers', 'Fetching contact teachers from PIFU'])
  const { data } = await axios.get(url, { headers: { Authorization: token } })
  logger('info', ['getContactTeachers', `Got ${data.length} contact teachers from PIFU`])
  return data
}
