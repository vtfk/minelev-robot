# minelev-robot
Nodejs script that handles documents from MinElev

## Definitions
### Flow
A definition of jobs that should be run for a given document-type. e.g how to handle elevsamtale

[See flow dir for current flows and their defined jobs](./flows)

### Job
A single job that can be run in a flow. e.g archive a document
Result of the job is stored in flowStatus

[See jobs dir for available jobs](./jobs)

### FlowStatus
Object that is created on a single document. Keeps tracks of which jobs have run, and result from the job
If a job is not enabled - it will not be present in flowstatus

## Scripts
### npm run start
Runs [./index.js](./index.js) - which is the main "robot", and does the following:
- Gets ready documents from db. [./robot/get-ready-documents.js](./robot/get-ready-documents.js)
- Readies documents [./robot/index.js](./robot/index.js)
- For each ready document [./robot/handle-document.js](./robot/handle-document.js)
  - Get corresponding flow {type}-{variant}
  - Run jobs that are enabled in the flow
  - Move to finished if everyting ran ok

### npm run status-alert
Creates a status-report and sends it to Teams-channel

### npm run delete-files
Deletes files in 'finished' and 'copies' directories

### npm run setup
Creates needed directories based on your .env preferences (see [#setup](#setup-and-development))

## Jobs (sorted in the same way the are run if they are enabled in a flow)
Almost all jobs can be tailored to suit a flow's needs (see the flows for examples/mappers) 
### KRR
Fetches info about an ssn from Kontakt og reservasjonsregisteret. Used mainly for getting preferred language for a person.
### FREG
Fetches info about an ssn from Folkeregisteret. Used mainly for getting parents for a person.
### SyncElevmappe
Creates/updates elevmappe in archive.
### AddParentsIfUnder18
Creates/updates privatepersons in archive for ssn's parents if ssn is under 18 of age, and if parents are found in folkeregisteret. Used when you need to send copy of document to guardians/parents.
### SyncEnterprise
Creates/updates enterprise in archive based on data fetched from Brønnøysundsregisteret (on enterprisenumber). Used when sending document to enterprise (yff-bekreftelse-bedrift)
### CreatePdf
Creates a pdf and returns it in base64-format. Base64 is saved as a separate txt-file in queue

**Special case:** If recipient have address block or has svarut exception - addresses are removed from the pdfs
### Archive
Archives document in archive.
### SvarUt
Sends archived document on svarut to recipients defined on archived document.

**Special cases:** Checks recipients in the following order:
1. Does student have address block => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student exists in SVARUT_EXCEPTIONS => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student have illegal zipCode => do not send on Svarut, send internal note to school that letter must be delivered to student manually
1. Does student not have registered parents and is under 18 => do not send on Svarut, send internal note to school that letter must be distributed manually to student and parents

### GetContactTeachers
Fetches contact-teachers for a student from PIFU-api. Used when you need to send email alerts to students contact teachers.

### SendEmail
Sends email to given recipients in the flows job-mapper. Can send any email to any recipent.

### UpdateDocumentStatus
Updates status on the document in the DB it was fetched from in the beginning. The statuses are used in frontend for users to see status on the document. Typically "queued - timestamp", "archived - timestamp", "sent - timestamp".

### Statistics
Creates anonymous statistics element in shared statistics database

### FailOnPurpose
Makes the flow fail - simply used for testing purposes when you need the flow to fail

## Setup and development
1. Clone project
1. `npm i`
1. Create .env with values from [.env](#env)
1. Run `npm run setup`
1. If production env - Create tasks that trigger different scripts as you like (e.g npm run start, npm run status-alert, npm run delete-files)

# .env
```bash
MONGODB_CONNECTION_STRING="connection string to Mongodb"
MONGODB_DB="name of database"
MONGODB_COLLECTION="name of collection"
DOCUMENT_DIR="./documents" # Optional, see default in ./config.js
DOCUMENTS_PER_RUN="how many documents to you want to fetch from DB each run"
LOG_DIR="./logs" # optional - where to store logs locally, if not defined, logs are not stored locally
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
TEAMS_STATUS_WEBHOOK_URL="teams webhook url" # Required when running script "status-alert". Where to send status-alert
PAPERTRAIL_HOST="papertrail host url" # Optional - if you want logging to papertrail
PAPERTRAIL_TOKEN="papertrail token" # Optiional - if you want logging to papertrail
SVARUT_EXCEPTIONS="12345678910,12345678911" # comma-separated ssn's that should not receive letter's on svarut
```


## Notes to remember stuff...
Samtale og notat skal ikke sendes ut (ikke-samtale skal faktisk sendes ut...)