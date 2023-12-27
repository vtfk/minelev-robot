const { MAIL: { TEMPLATE_NAME, MINELEV_URL } } = require('../config')

module.exports = (documentData) => {
  const mailText = `Hei!<br/><br/>${documentData.teacher.name} har sendt varsel til en av dine elever i MinElev.<br />
  Mer informasjon om varselet finner du <a href="${MINELEV_URL}/elever/${documentData.student.username}/${documentData._id}">på denne siden</a>.`
  const receivers = documentData.flowStatus.getContactTeachers.result.filter(teacher => teacher.username !== documentData.teacher.username).map(teacher => teacher.email)
  const mails = []
  for (const receiver of receivers) {
    mails.push({
      to: [receiver],
      from: 'MinElev <minelev@vtfk.no>',
      subject: 'Varsel sendt til en av dine elever',
      template: {
        templateName: TEMPLATE_NAME,
        templateData: {
          body: mailText,
          signature: {
            name: 'MinElev'
          }
        }
      }
    })
  }
  return mails
}
