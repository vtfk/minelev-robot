const hasSvarutException = require('./has-svarut-exception')

// Contacts in p360 are using dsf-info, so we cannot use freg addressegradering yet
const hasAddressBlock = (privatePerson) => {
  if (privatePerson.addressCode > 0) return true
  return false
}

// Contacts in p360 are using dsf-info, so we cannot use freg addressegradering yet
// ZipCodes in P360 must be length 4, if they are not, P360 will tell you that everything is a ok with Svarut - but not send it....
const validZipCode = (privatePerson) => {
  if (privatePerson.zipCode.length === 4) return true
  return false
}

module.exports = (documentData, exceptions) => {
  // If enterprise is mottaker
  if (documentData.flowStatus.syncEnterprise && documentData.variant === 'bekreftelse-bedrift') {
    if (documentData.flowStatus.syncEnterprise.result.result.enterprise.PostAddress.ZipCode.length !== 4) throw new Error('Enterprise ZipCode is not 4 digits!! Please edit in json-file, and run again')
    return { result: true, reason: 'all good' }
  }

  // If student is mottaker
  const mottakere = [documentData.flowStatus.syncElevmappe.result.privatePerson]
  // Check if student is over 18, and addParentsIfUnder18 is enabled
  if (documentData.flowStatus.addParentsIfUnder18 && documentData.flowStatus.freg.result.alder < 18) {
    // If under 18, add parents to the check
    for (const parent of documentData.flowStatus.addParentsIfUnder18.result) {
      mottakere.push(parent.privatePerson)
    }
  }
  for (const mottaker of mottakere) {
    if (hasAddressBlock(mottaker)) return { result: false, reason: 'addressBlock' }
    if (hasSvarutException(mottaker.ssn, exceptions)) return { result: false, reason: 'svarut exception' }
    if (!validZipCode(mottaker)) return { result: false, reason: 'wrong zipCode' }
  }
  if (documentData.flowStatus.addParentsIfUnder18 && documentData.flowStatus.freg.result.alder < 18) {
    // If under 18, check that we have parents
    if (documentData.flowStatus.addParentsIfUnder18.result.length === 0) return { result: false, reason: 'parents not found' }
  }
  return { result: true, reason: 'all good' }
}
