const description = 'Oppretter, arkiverer, og sender en YFF lokal læreplan for en elevs utplasseringer i bedrifter. Sendes svarut til eleven.'
const getSchoolData = require('../lib/get-school-data')
const { archive: { ROBOT_RECNO } } = require('../config')
const { readFileSync } = require('fs')

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
    // Vi trenger ikke freg her - brukes for å hente foreldreansvar når vi sender ut til foreldre og, det gjør vi ikke med yff-tilbakemelding
    enabled: false,
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
    enabled: false // Kun varsel som har dette
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
      return {
        title: 'Elevens lokale læreplan - yrkesfaglig fordypning - YFF',
        unofficialTitle: `Elevens lokale læreplan - yrkesfaglig fordypning - YFF - ${documentData.student.name} - ${schoolData.fullName} - ${schoolYear}`,
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
    enabled: false
  },
  sendEmail: {
    // Det er KUN yff-bekreftelse-bedrift som skal ha e-post varsling ut til bedriften :) Varsel skal sendes kontaktlærer
    enabled: false,
    mapper: (documentData) => {
      const mailText = 'Hei!<br/><br/>Her kommer en teste-epost'
      const receivers = ['tullball@vtfk.no']
      const mails = []
      for (const receiver of receivers) {
        mails.push({
          to: [receiver],
          from: 'MinElev <minelev@vtfk.no>',
          subject: 'Tester en e-post fra MinElev',
          template: {
            templateName: 'vtfk',
            templateData: {
              body: mailText,
              signature: {
                name: 'MinElev',
                company: 'Opplæring og folkehelse'
              }
            }
          }
        })
      }
      return mails
    }
  },
  updateDocumentStatus: {
    enabled: true
  },
  statistics: {
    enabled: true,
    mapper: (documentData) => {
      return {
        description,
        bedrifter: documentData.content.utplasseringer.map(u => u.name).join(', ')
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
