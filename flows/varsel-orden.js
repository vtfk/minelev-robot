const description = 'Oppretter, arkiverer, og sender et varsel i orden. Sendes svarut til eleven, og foresatte dersom under 18. E-post på kopi til kontaktlærere'
const getSchoolData = require('../lib/get-school-data')
const { archive: { ROBOT_RECNO } } = require('../config')
const { readFileSync } = require('fs')
const mailContactTeachers = require('../shared-mappers/mail-contact-teachers')

module.exports = {
  enabled: true,
  krr: {
    // Trenger denne for foretrukket språk på pdf
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  freg: {
    // Vi trenger ikke freg her - brukes for å hente foreldre
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  syncElevmappe: {
    // Denne trenger vi - oppdaterer/lager elevmappe
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  addParentsIfUnder18: {
    enabled: true // Kun varsel som har dette
  },
  syncEnterprise: {
    // Trengs kun hvis bedriften skal ha dokumentet på svarut
    enabled: false,
    mapper: (documentData) => {
      return {
        enterpriseNumber: documentData.content.utplassering.bedriftsData.organisasjonsNummer
      }
    }
  },
  createPdf: {
    enabled: true,
    mapper: (documentData) => {
      const privatePerson = documentData.flowStatus.syncElevmappe.result.privatePerson
      return {
        recipient: {
          fullname: documentData.student.name,
          streetAddress: privatePerson.streetAddress,
          zipCode: privatePerson.zipCode,
          zipPlace: privatePerson.zipPlace
        },
        student: documentData.student,
        created: {
          timestamp: documentData.created.timestamp
        },
        school: documentData.school,
        teacher: documentData.teacher,
        content: documentData.content
      }
    }
  },
  archive: {
    enabled: true,
    mapper: (documentData) => {
      /*
      "base64": "fhdjfhdjkfjsdf",
      "title": "dokument",
      "unofficialTitle": "dokument huhuhu",
      "ssn": "12345678910",
      "documentDate": "2021-09-27",
      "caseNumber": "30/00000",
      "schoolEnterpriseNumber": "202002",
      "accessGroup": "elev belev",
      "responsiblePersonRecno": "12345"
      */
      const privatePerson = documentData.flowStatus.syncElevmappe.result.privatePerson
      if (!privatePerson || !privatePerson.ssn) throw new Error('Missing data from job "syncElevmappe", please verify that the job has run successfully')
      const schoolYear = documentData.content.year
      if (!schoolYear) throw new Error('Missing property "year" from documentData.content, please check.')
      const schoolData = getSchoolData(documentData.school.id)
      const period = documentData.content.period.nb
      if (!period) throw new Error('Missing property "documentData.content.period.nb", please check.')
      return {
        title: `Varsel - orden - ${documentData.student.classId} - ${period} - ${schoolYear}`,
        unofficialTitle: `Varsel - orden - ${documentData.student.name} - ${documentData.student.classId} - ${period} - ${schoolYear}`,
        fileTitle: `Varsel - orden - ${documentData.student.classId.replace(':', '')} - ${period} - ${schoolYear}`,
        ssn: privatePerson.ssn,
        documentDate: new Date(documentData.created.timestamp).toISOString(),
        caseNumber: documentData.flowStatus.syncElevmappe.result.elevmappe.CaseNumber,
        schoolEnterpriseNumber: schoolData.organizationNumber,
        accessGroup: schoolData.accessGroup,
        responsiblePersonRecno: ROBOT_RECNO,
        base64: readFileSync(documentData.flowStatus.createPdf.result.path, 'utf-8')
      }
    }
  },
  svarut: {
    enabled: true
  },
  getContactTeachers: {
    enabled: true
  },
  sendEmail: {
    // Sender e-post varsel til kontaklærere (unntatt den som opprettet varselet)
    enabled: true,
    mapper: mailContactTeachers
  },
  updateDocumentStatus: {
    enabled: true
  },
  statistics: {
    enabled: true,
    mapper: (documentData) => {
      return {
        description,
        schoolYear: documentData.content.year
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
