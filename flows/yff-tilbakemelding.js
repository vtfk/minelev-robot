// Tuiuiui

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
  syncParents: {
    enabled: true
  },
  syncEnterprise: {
    enabled: true,
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
    metadata: (flowStatus) => {
      return {
        metadatablabla: "hjdhfjdf",
        contact: flowStatus.syncElevmappe.result.ssn
      }
    }
  },
  svarut: {
    enabled: true
  },
  email: {
    enabled: true,
    template: (flowStatus) => {
      return {
        subject: `Hallo ${data.subject}`,
        body: `<h1>Epost</h1>`
      }
    }
  },
  failOnPurpose: {
    enabled: true
  }
}