// Global config
require('dotenv').config()

const { getCurrentSchoolYear } = require('./lib/get-school-year')

// Retry list (number of minutes to wait before next retry [15, 60, 240, 3600] => wait 15 minutes until first retry, then 60 minutes until second retry and so on)
const retryList = (process.env.RETRY_INTERVALS_MINUTES && process.env.RETRY_INTERVALS_MINUTES.split(',').map(numStr => Number(numStr))) || [15, 60, 240, 3600]
retryList.unshift(0) // Add a zero at the start of the retry list to represent the first run

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  COUNTY_NUMBER: process.env.COUNTY_NUMBER,
  DOCUMENTS_PER_RUN: (process.env.DOCUMENTS_PER_RUN && Number(process.env.DOCUMENTS_PER_RUN)) || 10,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'super hemmelig nyckel',
  DELETE_FINISHED_AFTER_DAYS: process.env.DELETE_FINISHED_AFTER_DAYS || '30',
  RETRY_INTERVAL_MINUTES: retryList,
  TEAMS_STATUS_WEBHOOK_URL: process.env.TEAMS_STATUS_WEBHOOK_URL || 'hfoiudshfkjdsfdsf',
  MONGODB: {
    CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || undefined,
    COLLECTION: (process.env.MONGODB_COLLECTION && `${process.env.MONGODB_COLLECTION}-${getCurrentSchoolYear('-')}`) || undefined, // Automatically new collection every new schoolYear (swaps 15th of July)
    DB: process.env.MONGODB_DB || undefined
  },
  KRR: {
    URL: process.env.KRR_URL || 'nope',
    KEY: process.env.KRR_KEY || 'tutta'
  },
  APPREG: {
    CLIENT_ID: process.env.APPREG_CLIENT_ID || 'fdhkjfhdslkfdsf',
    TENANT_ID: process.env.APPREG_TENANT_ID || 'fkdf',
    CLIENT_SECRET: process.env.APPREG_CLIENT_SECRET || 'fhuhuhuhuhu'
  },
  FREG: {
    URL: process.env.FREG_URL || 'robin@rinbijij.no',
    API_SCOPE: process.env.FREG_API_SCOPE || 'skup'
  },
  ARCHIVE: {
    URL: process.env.ARCHIVE_URL || 'arkiv.nononono',
    API_SCOPE: process.env.ARCHIVE_API_SCOPE || 'skup',
    ROBOT_RECNO: process.env.ARCHIVE_ROBOT_RECNO || '200301' // (Vfk prod 200452, vfk test 200301) (tfk prod 200412, tfk test 200232)
  },
  PDF: {
    URL: process.env.PDF_URL || 'pdf.pdf.pdffffffff',
    KEY: process.env.PDF_KEY || 'keyndjn'
  },
  MAIL: {
    MINELEV_URL: process.env.MINELEV_URL || 'minelev.vtfk.no',
    URL: process.env.MAIL_URL || 'mailmau',
    KEY: process.env.MAIL_KEY || 'mimimi',
    TEMPLATE_NAME: process.env.MAIL_TEMPLATE_NAME || 'tempalate',
    SENDER: process.env.MAIL_SENDER || 'MinElev-TEST <minelev@vestfoldfylke.no>',
    DEV_RECEIVERS: (process.env.MAIL_DEV_RECEIVERS && process.env.MAIL_DEV_RECEIVERS.split(',')) || []
  },
  FINT_FOLK: {
    URL: process.env.FINT_FOLK_URL || 'fint.fintfolk',
    API_SCOPE: process.env.FINT_FOLK_API_SCOPE || 'skup'
  },
  STATISTICS: {
    URL: process.env.STATISTICS_URL,
    KEY: process.env.STATISTICS_KEY,
    COMPANY: process.env.STATISTICS_COMPANY || 'OPT'
  },
  SVARUT_EXCEPTIONS: (process.env.SVARUT_EXCEPTIONS && process.env.SVARUT_EXCEPTIONS.split(',')) || ['12345678910']
}
