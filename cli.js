#!/usr/bin/env node

const fetch = require('node-fetch')
const minimist = require('minimist')

const authorize = require('./lib/auth')

const help = () => {
  console.log(`
Usage: shmt [command] [flags]

Commands:
  - auth
  - get [url] --api-key=xxxx
  - help
`)
}

async function list(args) {
  const unprocessed = args['_']
  unprocessed.shift()

  const apiKey = args['api-key'];
  if (! apiKey) {
    throw new Error("Missing API key")
  }

  const query = `https://api.hubapi.com/content/api/v2/pages?hapikey=${apiKey}`

  const response = await fetch(query)

  if (response.status != 200) {
    throw new Error(`Invalid response: ${response.statusText}`)
  }

  const body = await response.json();
  for(const page of body.objects) {
    console.log("%s (id: %d, state: %s)", page.url, page.id, page.current_state)
  }
}



async function get(args) {
  const unprocessed = args['_']
  unprocessed.shift()

  const slug = unprocessed.shift()
  if (! slug) {
    throw new Error("Missing page to retrieve")
  }

  const apiKey = args['api-key'];
  if (! apiKey) {
    throw new Error("Missing API key")
  }

  const query = `https://api.hubapi.com/content/api/v2/pages?hapikey=${apiKey}`

  const response = await fetch(query)

  if (response.status != 200) {
    throw new Error(`Invalid response: ${response.statusText}`)
  }

  const body = await response.json();
  console.log("Response: %O", body)
}

/*
 * First step, authentication with OAuth. We may need to be able to 
 * do this more than once, for different systems, so we can associate
 * an access token and a refresh token with a portal.
 */

async function main() {
  const args = minimist(process.argv.slice(2))

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
  
    case 'list':
      await list(args)
      break;
    
    case 'get':
      await get(args)
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

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
