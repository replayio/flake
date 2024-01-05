import { defineConfig } from 'cypress'
const cypressReplay = require('@replayio/cypress')
const fs = require('fs')

const convertStringToInt = (string) => string.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

export default defineConfig({
  projectId: 'ovmwmi',
  e2e: {
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'results/my-test-output-[hash].xml',
    },
    env: {
      'cypress-watch-and-reload': {
        watch: 'js/*',
      },
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on = cypressReplay.wrapOn(on)
      cypressReplay.default(on, config, {
        upload: true,
        apiKey: process.env.REPLAY_API_KEY,
        initMetadataKeys: ['source'],
        filter: r =>
          r.status === "crashed"
          || r.metadata.test.result === "failed"
          || convertStringToInt(r.metadata.test.run.id) % 2 == 1,
      })

      on('after:run', (afterRun: any) => {
        const data = JSON.stringify(afterRun.totalDuration)
        const filename = 'duration.json'
        fs.writeFileSync(filename, data)
        console.log('cypress-json-results: wrote results to %s', filename)
      })

      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8888',
    excludeSpecPattern: ['*.page.ts', 'utils.ts', '*.d.ts'],
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
