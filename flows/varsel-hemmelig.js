const getSchoolData = require('../lib/get-school-data')
const { archive: { ROBOT_RECNO } } = require('../config')
const { readFileSync } = require('fs')

module.exports = {
  enabled: true,
  createPdf: {
    enabled: true,
    mapper: (documentData) => {
      return {
        created: documentData.created,
        school: documentData.school,
        student: documentData.student,
        teacher: documentData.teacher
      }
    }
  },
  archive: {
    enabled: true,
    mapper: (documentData) => {
      /*
      "organizationNumber": "00000",
      "base64": "fjkdsfhkdshkjfds",
      "accessGroup": "Elev gul skole",
      "title": "Tittlen",
      "unofficialTitle": "uosfififkefxszsd tittkdlf",
      "documentDate": "2021-09-27",
      "caseNumber": "30/00000",
      "responsiblePersonRecno": "343566"
      */
      const schoolData = getSchoolData(documentData.school.id)
      return {
        title: 'Varsel må sendes til elev',
        unofficialTitle: `Varsel må sendes til elev ${documentData.student.name}`,
        documentDate: new Date(documentData.created.timestamp).toISOString(),
        caseNumber: documentData.elevmappe.CaseNumber,
        organizationNumber: schoolData.organizationNumber,
        accessGroup: schoolData.accessGroup,
        responsiblePersonRecno: ROBOT_RECNO,
        base64: readFileSync(documentData.flowStatus.createPdf.result.path, 'utf-8')
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
