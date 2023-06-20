// Global config
require('dotenv').config()

// Retry list (number of minutes to wait before next retry [15, 60, 240, 3600] => wait 15 minutes until first retry, then 60 minutes until second retry and so on)
const retryList = (process.env.RETRY_INTERVALS_MINUTES && process.env.RETRY_INTERVALS_MINUTES.split(',').map(numStr => Number(numStr))) || [15, 60, 240, 3600]
retryList.unshift(0) // Add a zero at the start of the retry list to represent the first run

module.exports = {
  DOCUMENT_DIR: process.env.DOCUMENT_DIR || 'testdocs/documents',
  DOCUMENTS_PER_RUN: (process.env.DOCUMENTS_PER_RUN && Number(process.env.DOCUMENTS_PER_RUN)) || 10,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'super hemmelig nyckel',
  RETRY_INTERVAL_MINUTES: retryList,
  mongodb: {
    MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || undefined,
    MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || undefined,
    MONGODB_DB: process.env.MONGODB_DB || undefined
  },
  krr: {
    KRR_URL: process.env.KRR_URL || 'nope',
    KRR_SECRET: process.env.KRR_SECRET || 'tutta'
  },
  graphClient: {
    GRAPH_CLIENT_ID: process.env.GRAPH_CLIENT_ID || 'fdhkjfhdslkfdsf',
    GRAPH_TENANT_ID: process.env.GRAPH_TENANT_ID || 'fkdf',
    GRAPH_CLIENT_SECRET: process.env.GRAPH_CLIENT_SECRET || 'fhuhuhuhuhu'
  },
  freg: {
    FREG_URL: process.env.FREG_URL || 'robin@rinbijij.no',
    FREG_API_SCOPE: process.env.FREG_API_SCOPE || 'skup'
  },
  archive: {
    ARCHIVE_URL: process.env.ARCHIVE_URL || 'arkiv.nononono',
    ARCHIVE_SUBSCRIPTION_KEY: process.env.ARCHIVE_SUBSCRIPTION_KEY || '1234'
  },
  pdf: {
    PDF_URL: process.env.PDF_URL || 'pdf.pdf.pdffffffff'
  }
}
