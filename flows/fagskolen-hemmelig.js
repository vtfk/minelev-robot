const { NODE_ENV } = require('../config')
const { readFileSync } = require('fs')

module.exports = {
  enabled: true,
  createPdf: {
    enabled: true,
    mapper: (documentData) => {
      const variant = documentData.variant === 'forhandsvarsel' ? 'Forhåndsvarsel' : 'Dokument'
      return {
        created: documentData.created,
        school: documentData.school,
        student: documentData.student,
        teacher: documentData.teacher,
        documentNumber: documentData.documentNumber,
        variant
      }
    }
  },
  archive: {
    enabled: true,
    rawCall: true,
    mapper: (documentData) => {
      const variant = documentData.variant === 'forhandsvarsel' ? 'Forhåndsvarsel' : 'Dokument'
      const title = `${variant} må sendes til elev`
      return {
        AccessCode: '13',
        AccessGroup: 'Studentmapper',
        Category: 'Internt notat med oppfølging',
        Contacts: [
          {
            ReferenceNumber: NODE_ENV === 'production' ? 'recno:216024' : 'recno:200314',
            Role: 'Avsender'
          },
          {
            ReferenceNumber: NODE_ENV === 'production' ? 'recno:216024' : 'recno:200314',
            Role: 'Mottaker'
          }
        ],
        DocumentDate: new Date(documentData.created.timestamp).toISOString(),
        Files: [
          {
            Base64Data: readFileSync(documentData.flowStatus.createPdf.result.path, 'utf-8'),
            Category: '1',
            Format: 'pdf',
            Status: 'F',
            Title: title,
            VersionFormat: 'A'
          }
        ],
        Paragraph: 'Offl. § 13 jf. fvl. § 13 (1) nr.1',
        ResponsibleEnterpriseRecno: NODE_ENV === 'production' ? '216024' : '200314',
        Status: 'J',
        Title: title,
        UnofficialTitle: `${title} - ${documentData.student.name}`,
        Archive: 'Elevdokument',
        CaseNumber: documentData.elevmappe.CaseNumber
      }
    }
  },
  failOnPurpose: {
    enabled: false
  }
}
