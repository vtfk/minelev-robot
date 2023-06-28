const { mail } = require('../config')
const axios = require('axios').default
const generateJwt = require('../lib/generate-jwt')
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    throw new Error('No mapper defined in options. Please provide a custom mapper in flow definition')
  }
  logger('info', ['sendMail', 'Mapper is defined in options. Will use it.'])

  const mailData = mapper(documentData)

  const mailToken = generateJwt(mail.MAIL_JWT)

  const mailPayloads = Array.isArray(mailData) ? mailData : [mailData]
  logger('info', ['sendMail', `Sending ${mailPayloads.length} mails`])

  for (const mailPayload of mailPayloads) {
    logger('info', ['sendMail', `Sending mail to ${mailPayload.to.length} recipients`])
    await axios.post(mail.MAIL_URL, mailPayload, { headers: { Authorization: `Bearer ${mailToken}` } })
    logger('info', ['sendMail', `Sent mail to ${mailPayload.to.length} recipients`])
  }

  return `Sent ${mailPayloads.length} mails. Receivers: ${mailPayloads.map(m => m.to.join(', ')).join(', ')}`
}
