const getSchools = require('vtfk-schools-info')

module.exports = (schoolId) => {
  if (!schoolId) throw new Error('Missing required parameter "schoolId"')
  {
    const schoolInfo = getSchools({ schoolId })
    if (schoolInfo.length > 1) throw new Error(`Found several schools on schoolId "${schoolId}"`)
    if (schoolInfo.length === 1) return schoolId[0]
  }
  {
    const schoolInfo = getSchools({ schoolNumber: schoolId }) // Trying with schoolNumber if not match on schoolId (overgangstrikset...)
    if (schoolInfo.length > 1) throw new Error(`Found several schools on schoolNumber "${schoolId}"`)
    if (schoolInfo.length === 1) return schoolId[0]
  }
  throw new Error(`Could not find any school with schoolId of schoolNumber eqaul to "${schoolId}"`)
}
