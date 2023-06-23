const { SVARUT_EXCEPTIONS } = require('../config')

module.exports = (ssn, exceptions) => {
  if (!exceptions) exceptions = SVARUT_EXCEPTIONS
  if (exceptions.includes(ssn)) return true
  return false
}