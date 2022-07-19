#!/usr/bin/env node

const minimist = require('minimist')

const help = () => {

}

/*
 * First step, authentication with OAuth. We may need to be able to 
 * do this more than once, for different systems, so we can associate
 * an access token and a refresh token with a portal.
 */

const main = () => {
  const args = minimist(process.argv.slice(2))
  console.log("Hello world", args);

  const unprocessed = args['_']
}

main()
