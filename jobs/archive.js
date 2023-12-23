const { logger } = require('@vtfk/logger')
const hasSvarutException = require('../lib/has-svarut-exception')
const { callArchive } = require('../lib/call-archive')

const repackArchiveParents = (parents) => {
  const result = []
  for (const parent of parents) {
    result.push({
      ssn: parent.privatePerson.ssn,
      role: 'Mottaker',
      isUnofficial: true
    })
  }
  return result
}

module.exports = async (jobDef, documentData) => {
  const mapper = jobDef.mapper
  if (!mapper) {
    throw new Error('No mapper or default mapper is defined in options. Please provide a custom mapper or default mapper in flow definition')
  }
  logger('info', ['archive', 'Mapper is defined in options. Will use it.'])

  const archiveData = mapper(documentData)

  if (documentData.flowStatus.addParentsIfUnder18) { // If addParentsIfUnder18 is there, it means it is enabled
    if (!documentData.flowStatus?.syncElevmappe?.result?.privatePerson?.ssn) throw new Error('Job "syncElevmappe" must be run to be able to run job "archive"')
    if (hasSvarutException(documentData.flowStatus.syncElevmappe.result.privatePerson.ssn)) {
      logger('info', ['archive', 'student has svarut exception, will not add parents'])
    } else {
      logger('info', ['archive', 'job "addParentsIfUnder18" is enabled. Will add parents if we have them and student is under 18'])
      archiveData.contacts = repackArchiveParents(documentData.flowStatus.addParentsIfUnder18.result)
    }
  }

  const payload = {
    system: 'minelev',
    template: `${documentData.type}-${documentData.variant}`,
    parameter: archiveData
  }
  
  const data = await callArchive('archive', payload)
  logger('info', ['archive', 'Successfully archived document', data.DocumentNumber])
  return data
}
