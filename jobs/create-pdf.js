const axios = require('axios').default
const { PDF } = require('../config')
const { logger } = require('@vtfk/logger')
const getSchool = require('vtfk-schools-info')
const { writeFileSync } = require('fs')
const hasSvarutException = require('../lib/has-svarut-exception')

const createSchoolFooter = (school) => {
  if (school && school.id) {
    let schoolInfo = getSchool({ schoolId: school.id })
    if (schoolInfo.length === 1) { // We found specific school info
      schoolInfo = schoolInfo[0]
      const schoolFooter = {}
      if (schoolInfo.address && schoolInfo.address.street && schoolInfo.address.place && schoolInfo.address.place.length > 0) {
        schoolFooter.address = `${schoolInfo.address.street}, ${schoolInfo.address.place.charAt(0).toUpperCase() + schoolInfo.address.place.slice(1).toLowerCase()}`
      }
      schoolFooter.phoneNumber = schoolInfo.phoneNumber ?? null
      schoolFooter.mail = schoolInfo.mail ?? null
      schoolFooter.organizationNumber = schoolInfo.organizationNumber ?? null
      return schoolFooter
    }
  }
  return null
}

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    logger('info', ['createPdf', 'No mapper or default mapper is defined in options'])
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['createPdf', 'Mapper is defined in options. Will use it.'])
  const pdfData = mapper(documentData)
  pdfData.schoolFooter = createSchoolFooter(documentData.school)

  // Check address-block and exception, remove address if exists
  if (documentData.flowStatus?.syncElevmappe?.result) {
    if (documentData.flowStatus.syncElevmappe.result.privatePerson.addressCode > 0 || documentData.flowStatus.syncElevmappe.result.privatePerson.addressProtection) {
      logger('info', ['createPdf', 'Address code not 0 or address protection, removing address from pdf'])
      delete pdfData.recipient?.streetAddress
      delete pdfData.recipient?.zipCode
      delete pdfData.recipient?.zipPlace
    }
    if (hasSvarutException(documentData.flowStatus.syncElevmappe.result.privatePerson.ssn)) {
      logger('info', ['createPdf', 'Has svarut-exception, removing address from pdf'])
      delete pdfData.recipient?.streetAddress
      delete pdfData.recipient?.zipCode
      delete pdfData.recipient?.zipPlace
    }
  }

  const spraak = documentData.flowStatus.krr?.result?.spraak || 'nb'

  const payload = {
    system: 'minelev',
    template: `${documentData.type}/${documentData.variant}`,
    language: spraak,
    type: '2',
    version: 'B',
    data: pdfData
  }

  const { data } = await axios.post(`${PDF.URL}/generate`, payload, { headers: { 'x-functions-key': PDF.KEY } })
  logger('info', ['createPdf', 'Successfully created pdf, saving to file'])
  const savePath = `./documents/queue/${documentData._id}_pdf.txt`
  writeFileSync(savePath, data.data.base64)
  return {
    msg: 'Successfully saved pdf as base64',
    path: savePath,
    filename: `${documentData._id}_pdf.txt`
  }
}
