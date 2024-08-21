const description = 'Oppretter, arkiverer, og sender en bekreftelse på utplassering for en elevs utplassering i bedrift. Sendes svarut til bedriften. Samt kopi på e-post til kopimottakere'
const getSchoolData = require('../lib/get-school-data')
const { ARCHIVE: { ROBOT_RECNO }, MAIL: { TEMPLATE_NAME, SENDER } } = require('../config')
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
    enabled: true,
    mapper: (documentData) => {
      return {
        enterpriseNumber: documentData.content.bekreftelse.bedriftsData.organisasjonsNummer
      }
    }
  },
  createPdf: {
    enabled: true,
    mapper: (documentData) => {
      const enterprise = documentData.flowStatus.syncEnterprise.result.enterprise
      if (!enterprise?.PostAddress?.StreetAddress) throw new Error('Could not get PostAddress from syncEnterprise job - please check enterprise')
      return {
        recipient: {
          navn: enterprise.Name,
          adresse: enterprise.PostAddress.StreetAddress,
          postnummer: enterprise.PostAddress.ZipCode,
          poststed: enterprise.PostAddress.ZipPlace
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
      "organizationNumber": "12345678910",
      "documentDate": "2021-09-27",
      "caseNumber": "30/00000",
      "schoolEnterpriseNumber": "202002",
      "accessGroup": "elev belev",
      "responsiblePersonRecno": "12345"
      */
      const schoolYear = documentData.content.year
      if (!schoolYear) throw new Error('Missing property "year" from documentData.content, please check.')
      const schoolData = getSchoolData(documentData.school.id)
      return {
        title: 'Bekreftelse til bedrift - yrkesfaglig fordypning - YFF',
        unofficialTitle: `Bekreftelse til bedrift - yrkesfaglig fordypning - YFF - ${documentData.student.name} - ${schoolData.fullName} - ${schoolYear}`,
        organizationNumber: documentData.content.bekreftelse.bedriftsData.organisasjonsNummer,
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
    // Det er KUN yff-bekreftelse-bedrift som skal ha e-post varsling ut til bedriften :) Her er den altså på
    enabled: true,
    mapper: (documentData) => {
      const mailText = 'Hei!<br/><br/>Vedlagt oversendes bekreftelse på utplassering av elev i YFF.<br />'
      const receivers = documentData.content.bekreftelse.kopiPrEpost
      const mails = []
      for (const receiver of receivers) {
        mails.push({
          to: [receiver],
          from: SENDER,
          subject: 'Bekreftelse om utplassering av elev',
          attachments: [
            {
              content: readFileSync(documentData.flowStatus.createPdf.result.path, 'utf-8'),
              filename: 'Bekreftelse-utplassering.pdf',
              type: 'application/pdf'
            }
          ],
          template: {
            templateName: TEMPLATE_NAME,
            templateData: {
              body: mailText,
              signature: {
                name: documentData.teacher.name,
                company: documentData.school.name,
                virksomhet: true
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
        bedrift: documentData.content.bekreftelse.bedriftsNavn
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
