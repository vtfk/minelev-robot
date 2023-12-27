(async () => {
  const { logger, logConfig } = require('@vtfk/logger')
  const { MONGODB, TEAMS_STATUS_WEBHOOK_URL } = require('../config')
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
  const numberOfReadyDocuments = await collection.count({ isQueued: true })
  logger('info', ['statusAlert', `${numberOfReadyDocuments} ready documents in queue`])

  const dirCheck = {}
  const dirsToCheck = ['copies', 'failed', 'finished', 'queue']
  for (const dir of dirsToCheck) {
    const files = readdirSync(`./documents/${dir}`).filter(file => file.endsWith('.json'))
    dirCheck[dir] = files.length
    logger('info', ['statusAlert', `${files.length} documents in dir "${dir}"`])
  }

  let msg
  let colour
  const problems = numberOfReadyDocuments + dirCheck.failed
  if (problems === 0) {
    msg = 'Alt er tipp topp, tommel opp!'
    colour = '1ea80c'
  } else if (problems > 100) {
    msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er kritisk mange feil og noe må gjøres!`
    colour = 'a80c0c'
  } else if (problems > 50) {
    msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er en del feil altså og noe bør gjøres!`
    colour = 'ab57f35'
  } else if (problems > 20) {
    msg = `${problems} dokumenter i kø  + dokumenter i failed. Dette er noen feil og ta en sjekk om du har tid.`
    colour = 'e2ed13'
  } else if (problems > 10) {
    msg = `${problems} dokumenter i kø  + dokumenter i failed. Det er sikkert noe megafarlig, ta en sjekk om du har tid.`
    colour = 'e2ed13'
  } else {
    msg = `${problems} dokumenter i kø  + dokumenter i failed. Ta en sjekk om du gidder.`
    colour = 'e2ed13'
  }

  const teamsMsg = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: colour,
    summary: msg,
    title: '<h1 style="color:green;"> Statusrapport - MinElev robot </h1>',
    // text: '![Alt text for the image](https://cdn.iconscout.com/icon/premium/png-256-thumb/room-service-4114792-3410705.png)',
    sections: [
      {
        activityTitle: `**${numberOfReadyDocuments}** dokumenter i kø i mongodb`,
        activitySubtitle: 'Dette er dokumenter som er sendt inn fra MinElev, og klare for å plukkes av roboten',
        markdown: true
      },
      {
        activityTitle: `**${dirCheck.queue}** dokumenter i kø på server`,
        activitySubtitle: 'Dette er dokumenter som er sendt inn fra MinElev, og ligger klare for håndtering i kø på server',
        markdown: true
      },
      {
        activityTitle: `**${dirCheck.failed}** dokumenter som har feilet på server`,
        activitySubtitle: 'Dette er dokumenter som er forsøkt for mange ganger, og trenger hjelp',
        markdown: true
      },
      {
        activityTitle: `**${dirCheck.finished}** dokumenter som er ferdigstilt på server`,
        activitySubtitle: 'Dette er dokumenter som er sendt inn fra MinElev, og er ferdig håndtert på server - vil bli slettet ved neste slettejobb',
        markdown: true
      },
      {
        activityTitle: `**${dirCheck.copies}** dokumenter som ligger kopiert som backup på server`,
        activitySubtitle: 'Dette er dokumenter som er sendt inn fra MinElev, og er kopiert som backup på server - vil bli slettet ved neste slettejobb',
        markdown: true
      },
      {
        text: '![Alt text for the image](https://media3.giphy.com/media/N8wR1WZobKXaE/giphy.gif)'
      }
    ]
  }
  const headers = { contentType: 'application/vnd.microsoft.teams.card.o365connector' }
  await axios.post(TEAMS_STATUS_WEBHOOK_URL, teamsMsg, { headers })
  await disconnect()
})()
