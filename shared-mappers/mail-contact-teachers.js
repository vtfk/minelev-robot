const { MAIL: { TEMPLATE_NAME, MINELEV_URL, SENDER } } = require('../config')

module.exports = (documentData) => {
  const studentFeidenavnPrefix = documentData.student.feidenavn.substring(0, documentData.student.feidenavn.indexOf('@'))
  const mailText = `Hei!<br/><br/>${documentData.teacher.name} har sendt varsel til en av dine elever i MinElev.<br />
  Mer informasjon om varselet finner du <a href="${MINELEV_URL}/elever/${studentFeidenavnPrefix}/dokumenter/${documentData._id}">på denne siden</a>.`
  const otherContactTeachersAtSameSchool = documentData.flowStatus.getContactTeachers.result.filter(teacher => teacher.feidenavn !== documentData.teacher.feidenavn && teacher.skole.skolenummer === documentData.school.id) // kun kontaktlærere (unntatt læreren selv) ved skolen det gjelder
  const receivers = otherContactTeachersAtSameSchool.map(teacher => teacher.kontaktEpostadresse)
  const mails = []
  for (const receiver of receivers) {
    mails.push({
      to: [receiver],
      from: SENDER,
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
