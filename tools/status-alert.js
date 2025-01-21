(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { MONGODB, TEAMS_STATUS_WEBHOOK_URL, COUNTY_NUMBER } = require('../config')
  const { connect, disconnect } = require('../lib/mongo-client')
  const { readdirSync } = require('fs')
  const axios = require('axios')
  const { createLocalLogger } = require('../lib/local-logger')

  // Set up logging
  logConfig({
    teams: {
      onlyInProd: false
    },
    localLogger: createLocalLogger('status-alert')
  })

  logger('info', ['statusAlert', 'Fetching ready documents from mongodb'])
  const mongoClient = await connect()
  const collection = mongoClient.db(MONGODB.DB).collection(MONGODB.COLLECTION)
  const numberOfReadyDocuments = await collection.count({ isQueued: true, 'county.countyNumber': COUNTY_NUMBER })
  logger('info', ['statusAlert', `${numberOfReadyDocuments} ready documents in queue`])

  const dirCheck = {}
  const dirsToCheck = ['copies', 'failed', 'finished', 'queue']
  for (const dir of dirsToCheck) {
    const files = readdirSync(`./documents/${dir}`).filter(file => file.endsWith('.json'))
    dirCheck[dir] = files.length
    logger('info', ['statusAlert', `${files.length} documents in dir "${dir}"`])
  }

  let colour
  const problems = numberOfReadyDocuments + dirCheck.failed
  if (problems === 0) {
    // msg = 'Alt er tipp topp, tommel opp!'
    colour = 'good'
  } else if (problems > 100) {
    // msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er kritisk mange feil og noe må gjøres!`
    colour = 'attention'
  } else if (problems > 50) {
    // msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er en del feil altså og noe bør gjøres!`
    colour = 'attention'
  } else if (problems > 20) {
    // msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er noen feil og ta en sjekk om du har tid.`
    colour = 'warning'
  } else if (problems > 10) {
    // msg = `${problems} dokumenter i kø  + dokumenter i failed. Det er sikkert noe megafarlig, ta en sjekk om du har tid.`
    colour = 'warning'
  } else {
    // msg = `${problems} dokumenter i kø  + dokumenter i failed. Ta en sjekk om du gidder.`
    colour = 'warning'
  }

  const teamsMsg = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.5',
          msteams: { width: 'full' },
          body: [
            {
              type: 'TextBlock',
              text: `Statusrapport - MinElev robot - ${COUNTY_NUMBER === '39' ? 'Vestfold' : 'Telemark'}`,
              wrap: true,
              style: 'heading',
              color: colour
            },
            // Kø
            {
              type: 'TextBlock',
              text: `**${numberOfReadyDocuments}** dokumenter i kø i mongodb`,
              wrap: true,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: 'Dette er dokumenter som er sendt inn fra MinElev, og klare for å plukkes av roboten',
              wrap: true
            },
            // Kø på server
            {
              type: 'TextBlock',
              text: `**${dirCheck.queue}** dokumenter i kø på server`,
              wrap: true,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: 'Dette er dokumenter som er sendt inn fra MinElev, og ligger klare for håndtering i kø på server',
              wrap: true
            },
            // Feilet på server
            {
              type: 'TextBlock',
              text: `**${dirCheck.failed}** dokumenter som har feilet på server`,
              wrap: true,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: 'Dette er dokumenter som er forsøkt for mange ganger, og trenger hjelp',
              wrap: true
            },
            // Ferdig på server
            {
              type: 'TextBlock',
              text: `**${dirCheck.finished}** dokumenter som er ferdigstilt på server`,
              wrap: true,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: 'Dette er dokumenter som er sendt inn fra MinElev, og er ferdig håndtert på server - vil bli slettet ved neste slettejobb',
              wrap: true
            },
            // Backup på server
            {
              type: 'TextBlock',
              text: `**${dirCheck.copies}** dokumenter som ligger kopiert som backup på server`,
              wrap: true,
              weight: 'Bolder',
              size: 'Medium'
            },
            {
              type: 'TextBlock',
              text: 'Dette er dokumenter som er sendt inn fra MinElev, og er kopiert som backup på server - vil bli slettet ved neste slettejobb',
              wrap: true
            },
            // Gif
            {
              type: 'Image',
              url: 'https://media3.giphy.com/media/N8wR1WZobKXaE/giphy.gif',
              horizontalAlignment: 'Center'
            }
          ]
        }
      }
    ]
  }

  const headers = { contentType: 'application/vnd.microsoft.teams.card.o365connector' }
  await axios.post(TEAMS_STATUS_WEBHOOK_URL, teamsMsg, { headers })
  await disconnect()
})()
