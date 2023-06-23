const getSchools = require('vtfk-schools-info')

module.exports = (schoolId) => {
  if (!schoolId) throw new Error('Missing required parameter "schoolId"')

  const schoolInfo = getSchools({ schoolId })
  if (schoolInfo.length > 1) throw new Error(`Found several schools on schoolId ${schoolId}`)
  if (schoolInfo.length === 0) throw new Error(`Could not find any school with schoolId ${schoolId}`)
  return schoolInfo[0]
}
