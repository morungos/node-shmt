#!/usr/bin/env node

const minimist = require('minimist')

const authorize = require('./lib/auth')

const help = () => {
  console.log(`
Usage: shmt [command] [flags]

Commands:
  - auth
  - help
`)
}

/*
 * First step, authentication with OAuth. We may need to be able to 
 * do this more than once, for different systems, so we can associate
 * an access token and a refresh token with a portal.
 */

async function main() {
  const args = minimist(process.argv.slice(2))
  console.log("Hello world", args);

  const unprocessed = args['_']
  if (unprocessed.length == 0) {
    return help()
  }
  
  const command = unprocessed[0]
  switch (command) {
    case 'help':
      help()
      break;

    case 'auth':
      await authorize()
      break;
  
    default:
      console.error(`
Unexpected command: ${command}

Use "shmt help" for more information`
      )
      process.exit(1)
      break;
  }

}

main()
