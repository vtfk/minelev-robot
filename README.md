# minelev-robot
Nodejs script that handles documents from MinElev

# Flow
A definition of jobs that should be run for a given document-type. e.g how to handle elevsamtale

# Job
A single job that can be run in a flow. e.g archive a document

# FlowStatus
If a job is not enabled - it will not be present in flowstatus

# Notes
Samtale og notat skal ikke sendes ut (ikke-samtale skal faktisk sendes ut...)

# SvarUt, parent, and address handling
Checks in following order
1. Does student have classified address => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student exists in SVARUT_EXCEPTIONS => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student have illegal zipCode => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student not have registered parents and is under 18 => do not send on Svarut, send internal note to school that letter must be distributed manually to student and parents

# .env
```bash
MONGODB_CONNECTION_STRING="connection string to Mongodb"
MONGODB_DB="name of database"
MONGODB_COLLECTION="name of collection"
DOCUMENT_DIR="./documents" # Optional, see default in ./config.js
DOCUMENTS_PER_RUN="how many documents to you want to fetch from DB each run"
LOG_DIR="./logs" # optional - where to store logs locally
ENCRYPTION_KEY="super secret key"
RETRY_INTERVALS_MINUTES="5,30,60,60,60" # Intervals between retries for a document in minutes
KRR_URL="url to KRR api"
KRR_SECRET="KRR secret for signing jwt"
GRAPH_CLIENT_SECRET="client secret from app registration"
GRAPH_TENANT_ID="tenant id for app registration"
GRAPH_CLIENT_ID="client id for app registration"
FREG_API_SCOPE="api://client-id-freg-app-registration/.default"
FREG_URL="url to FREG api"
ARCHIVE_URL="url to ARCHIVE api"
ARCHIVE_SUBSCRIPTION_KEY="subscription key for ARCHIVE api"
PDF_URL="url for pdf-generator api"
PIFU_JWT_SECRET="PIFU secret for signing jwt"
PIFU_URL="url to PIFU api"
MAIL_URL="https://url-to-mail-api.com?subscription-key=subscription-key-for-mail-api"
MAIL_JWT="MAIL secret for signing jwt"
MINELEV_URL="url to minelev frontend"
STATISTICS_SUBSCRIPTION_KEY="subscription key for statistics api"
STATISTICS_URL="url for statistics api"
TEAMS_WEBHOOK_URL="teams webhook url" # Optional - if you want error and warn to teams channel
SVARUT_EXCEPTIONS="12345678910,12345678911" # comma-separated ssn's that should not receive letter's on svarut
```
