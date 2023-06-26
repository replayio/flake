import { defineConfig } from 'cypress'
const cypressReplay = require('@replayio/cypress')
const fs = require('fs')

export default defineConfig({
  projectId: 'ovmwmi',
  e2e: {
    retries: 2,
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
	require('@cypress/code-coverage/task')(on, config);
      cypressReplay.default(on, config)

      on('after:run', (afterRun: any) => {
        const data = JSON.stringify(afterRun.totalDuration);
        const filename = "duration.json"
        fs.writeFileSync(filename, data);
        console.log('cypress-json-results: wrote results to %s', filename);
      })

      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8888',
    excludeSpecPattern: ['*.page.ts', 'utils.ts', '*.d.ts'],
    specPattern: 'cypress/e2e/**/*spec.{js,ts}',
  },
})
