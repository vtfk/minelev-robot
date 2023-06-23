// Tuiuiui
const getSchoolData = require('../lib/get-school-data')
const { archive: { ROBOT_RECNO }, DOCUMENT_DIR } = require('../config')
const { readFileSync } = require('fs')

module.exports = {
  enabled: true,
  krr: {
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  freg: {
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  syncElevmappe: {
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
          fullname: documentData.flowStatus.freg.result.fulltnavn,
          streetAddress: privatePerson.streetAddress,
          zipCode: privatePerson.zipCode,
          zipPlace: privatePerson.zipPlace
        },
        student: {
          name: documentData.flowStatus.freg.result.fulltnavn,
          level: documentData.student.level,
        },
        created: {
          timestamp: documentData.created.timestamp
        },
        school: {
          name: documentData.school.name
        },
        teacher: {
          name: documentData.teacher.name
        },
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
      const fregData = documentData.flowStatus.freg.result
      if (!fregData || !fregData.fulltnavn || !fregData.foedselsEllerDNummer) throw new Error('Missing data from job "freg", please verify that the job has run successfully')
      const schoolYear = documentData.content.year
      if (!schoolYear) throw new Error('Missing property "year" from documentData.content, please check.')
      const schoolData = getSchoolData(documentData.school.id)
      return {
        title: `Tilbakemeldingsskjema - arbeidspraksis - yrkesfaglig fordypning - YFF`,
        unofficialTitle: `Tilbakemeldingsskjema - arbeidspraksis - yrkesfaglig fordypning - YFF - ${fregData.fulltnavn} - ${schoolData.fullName} - ${schoolYear}`,
        ssn: fregData.foedselsEllerDNummer,
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
    enabled: true,
    mapper: (documentData) => {
      const mailText = `Hei!<br/><br/>Her kommer en teste-epost`
      const receivers = ['mail@mail.com', 'mail@jiji.com']
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
  failOnPurpose: {
    enabled: true
  }
}