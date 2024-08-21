const { MAIL, NODE_ENV } = require('../config')
const axios = require('axios').default
const { logger } = require('@vtfk/logger')

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    throw new Error('No mapper defined in options. Please provide a custom mapper in flow definition')
  }
  logger('info', ['sendMail', 'Mapper is defined in options. Will use it.'])

  const mailData = mapper(documentData)

  const mailPayloads = Array.isArray(mailData) ? mailData : [mailData]
  logger('info', ['sendMail', `Sending ${mailPayloads.length} mails`])

  // If NODE_ENV is not production - override email receivers to MAIL.DEV_RECEIVERS, don't want to send to actual users or organization in test / dev
  if (NODE_ENV !== 'production') {
    logger('info', ['sendMail', `NODE_ENV is not production. Overriding receivers to MAIL.DEV_RECEIVERS: ${MAIL.DEV_RECEIVERS}`, 'original receivers', mailPayloads.map(m => m.to.join(', ')).join(', ')])
    mailPayloads.forEach(payload => {
      payload.to = MAIL.DEV_RECEIVERS
      if (payload.cc) payload.cc = MAIL.DEV_RECEIVERS
      if (payload.bcc) payload.bcc = MAIL.DEV_RECEIVERS
    })
  }

  for (const mailPayload of mailPayloads) {
    logger('info', ['sendMail', `Sending mail to ${mailPayload.to.length} recipients`])
    await axios.post(MAIL.URL, mailPayload, { headers: { 'x-functions-key': MAIL.KEY } })
    logger('info', ['sendMail', `Sent mail to ${mailPayload.to.length} recipients`])
  }

  return `Sent ${mailPayloads.length} mails. Receivers: ${mailPayloads.map(m => m.to.join(', ')).join(', ')}`
}
