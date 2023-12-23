// Global config
require('dotenv').config()

// Retry list (number of minutes to wait before next retry [15, 60, 240, 3600] => wait 15 minutes until first retry, then 60 minutes until second retry and so on)
const retryList = (process.env.RETRY_INTERVALS_MINUTES && process.env.RETRY_INTERVALS_MINUTES.split(',').map(numStr => Number(numStr))) || [15, 60, 240, 3600]
retryList.unshift(0) // Add a zero at the start of the retry list to represent the first run

module.exports = {
  COUNTY_NUMBER: process.env.COUNTY_NUMBER,
  DOCUMENT_DIR: process.env.DOCUMENT_DIR || 'testdocs/documents',
  DOCUMENTS_PER_RUN: (process.env.DOCUMENTS_PER_RUN && Number(process.env.DOCUMENTS_PER_RUN)) || 10,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'super hemmelig nyckel',
  RETRY_INTERVAL_MINUTES: retryList,
  TEAMS_STATUS_WEBHOOK_URL: process.env.TEAMS_STATUS_WEBHOOK_URL || 'hfoiudshfkjdsfdsf',
  MONGODB: {
    CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || undefined,
    COLLECTION: process.env.MONGODB_COLLECTION || undefined,
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
    ROBOT_RECNO: process.env.ROBOT_RECNO || '200336' // Prod is 200326
  },
  PDF: {
    URL: process.env.PDF_URL || 'pdf.pdf.pdffffffff',
    KEY: process.env.PDF_KEY || 'keyndjn'
  },
  MAIL: {
    MINELEV_URL: process.env.MINELEV_URL || 'minelev.vtfk.no',
    URL: process.env.MAIL_URL || 'mailmau',
    KEY: process.env.MAIL_KEY || 'mimimi',
    TEMPLATE_NAME: process.env.MAIL_TEMPLATE_NAME || 'tempalate'
  },
  pifu: {
    PIFU_URL: process.env.PIFU_URL || 'pifu.pifu',
    PIFU_JWT_SECRET: process.env.PIFU_JWT_SECRET || 'secret secret'
  },
  STATISTICS: {
    URL: process.env.STATISTICS_URL,
    KEY: process.env.STATISTICS_KEY
  },
  SVARUT_EXCEPTIONS: (process.env.SVARUT_EXCEPTIONS && process.env.SVARUT_EXCEPTIONS.split(',')) || ['12345678910']
}
