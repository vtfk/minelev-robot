const description = 'Oppretter, arkiverer, og sender et forhåndsvarsel i emne for fagskolen. Sendes svarut til studenten.'
const { NODE_ENV } = require('../config')
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
    // Vi trenger ikke freg her - brukes for å hente foreldre, alle studentene skal visstnok være over 18
    enabled: false,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber
      }
    }
  },
  syncElevmappe: {
    // Denne trenger vi - oppdaterer/lager studentmappe
    enabled: true,
    mapper: (documentData) => {
      return {
        ssn: documentData.student.personalIdNumber,
        isStudentmappe: true
      }
    }
  },
  addParentsIfUnder18: {
    enabled: false // Alle er studentene er visst over 18
  },
  syncEnterprise: {
    // Ingen bedrifter her gitt
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
    rawCall: true,
    mapper: (documentData) => {
      const studentMappeCaseNumber = documentData.flowStatus.syncElevmappe.result.elevmappe.CaseNumber
      const privatePerson = documentData.flowStatus.syncElevmappe.result.privatePerson
      if (!privatePerson || !privatePerson.ssn) throw new Error('Missing data from job "syncElevmappe", please verify that the job has run successfully')
      const courseTitle = documentData.content.course.name
      const courseFileTitle = courseTitle.replaceAll('/', '').replaceAll(':', '')
      return {
        AccessCode: '13',
        AccessGroup: 'Studentmapper',
        Category: 'Dokument ut',
        Contacts: [
          {
            IsUnofficial: true,
            ReferenceNumber: privatePerson.ssn,
            Role: 'Mottaker',
            DispatchChannel: 'recno:12'
          }
        ],
        DocumentDate: new Date(documentData.created.timestamp).toISOString(),
        Files: [
          {
            Base64Data: readFileSync(documentData.flowStatus.createPdf.result.path, 'utf-8'),
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: `Forhåndsvarsel - ikke bestått arbeidskrav - ${courseFileTitle}`,
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseRecno: NODE_ENV === 'production' ? '216024' : '200314',
        Status: 'R',
        Title: `Forhåndsvarsel - ikke bestått arbeidskrav - ${courseTitle}`,
        UnofficialTitle: `Forhåndsvarsel - ikke bestått arbeidskrav - ${courseTitle} - ${documentData.student.name}`,
        Archive: 'Elevdokument',
        CaseNumber: studentMappeCaseNumber
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
    // Sender e-post varsel til kontaklærere (unntatt den som opprettet varselet)
    enabled: false,
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
        courseId: documentData.content.course.id,
        courseName: documentData.content.course.name
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
