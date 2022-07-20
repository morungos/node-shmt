#!/usr/bin/env node

const fs = require('fs/promises');
const createReadStream = require('fs').createReadStream;
const { finished } = require('stream/promises')

const fetch = require('node-fetch')
const minimist = require('minimist')

const processPageData = require('./lib/process')

const csv = require("csv-parse")

const help = () => {
  console.log(`
Usage: shmt [command] [flags]

Commands:
  - auth
  - list --api-key=xxxx
  - get <url> --api-key=xxxx
  - create <url> --api-key=xxxx --data file.json
  - help
`)
}

async function readCSVFile(filename) {
  const records = [];
  const parser = createReadStream(filename)
    .pipe(csv.parse({}));
  parser.on('readable', function(){
    let record; while ((record = parser.read()) !== null) {
    // Work with each record
      records.push(record);
    }
  });
  await finished(parser);
  return records;
}

async function list(args) {
  const unprocessed = args['_']
  unprocessed.shift()

  const apiKey = args['api-key'];
  if (! apiKey) {
    throw new Error("Missing API key")
  }

  const query = `https://api.hubapi.com/cms/v3/pages/site-pages?hapikey=${apiKey}`

  const response = await fetch(query)

  if (response.status != 200) {
    throw new Error(`Invalid response: ${response.statusText}`)
  }

  const body = await response.json();
  // console.log("%s", JSON.stringify(body, null, 2))

  for(const page of body.results) {
    console.log("/%s (id: %d, state: %s)", page.slug, page.id, page.state)
  }
}


function applyMapping(value, mapping) {
  if (! mapping) {
    return void 0
  }
  if (typeof value === 'string') {
    for(let rule of mapping) {
      value = value.replaceAll(rule[0], rule[1])
    }
    return value
  }

  return void 0
}


async function getData(args, mapping) {
  const dataFile = args['data'];
  if (! dataFile) {
    throw new Error("Missing data file")
  }

  let data = await fs.readFile(dataFile)
  if (! data) {
    throw new Error("Failed to open data file")
  }

  data = JSON.parse(data.toString())

  const updated = processPageData(data, (val) => applyMapping(val, mapping))
  return updated
}


async function create(args) {
  const unprocessed = args['_']
  unprocessed.shift()

  const slug = unprocessed.shift()
  if (! slug) {
    throw new Error("Missing page to retrieve")
  }

  if (! slug.startsWith("/")) {
    throw new Error("Invalid URL: " + slug)
  }

  const apiKey = args['api-key'];
  if (! apiKey) {
    throw new Error("Missing API key")
  }

  let mapping = args['mapping-file'];
  if (mapping) {
    mapping = await readCSVFile(mapping);
  }

  let data = args['data'];
  data = await fs.readFile(data);
  data = JSON.parse(data.toString())

  let dryRun = args['dry-run'];

  const updated = await getData(args, mapping)
  updated.slug = slug
  console.log("%s", JSON.stringify(updated, null, 2))

  const query = `https://api.hubapi.com/cms/v3/pages/site-pages?hapikey=${apiKey}`
  console.log(`About to POST to: ${query}`)

  if (dryRun) {
    return
  }

  const response = await fetch(query, {
    method: 'post',
    body: JSON.stringify(updated),
    headers: {'Content-Type': 'application/json'}
  });

  if (response.status != 200) {
    throw new Error(`Invalid response: ${response.statusText}`)
  }

  const body = await response.json()
  console.log("%s", JSON.stringify(body, null, 2))
}


async function get(args) {
  const unprocessed = args['_']
  unprocessed.shift()

  const slug = unprocessed.shift()
  if (! slug) {
    throw new Error("Missing page to retrieve")
  }

  if (! slug.startsWith("/")) {
    throw new Error("Invalid URL: " + slug)
  }

  const apiKey = args['api-key'];
  if (! apiKey) {
    throw new Error("Missing API key")
  }

  const query = `https://api.hubapi.com/cms/v3/pages/site-pages?hapikey=${apiKey}&slug=${slug.slice(1)}`

  const response = await fetch(query)

  if (response.status != 200) {
    throw new Error(`Invalid response: ${response.statusText}`)
  }

  const body = await response.json()
  const results = body.results

  if (results.length != 1) {
    throw new Error("Can't find page: " + slug)
  }

  console.log("%s", JSON.stringify(results[0], null, 2))
}

/*
 * First step, authentication with OAuth. We may need to be able to 
 * do this more than once, for different systems, so we can associate
 * an access token and a refresh token with a portal.
 */

async function main() {
  const args = minimist(process.argv.slice(2), {
    boolean: ['dry-run']
  })

  const unprocessed = args['_']
  if (unprocessed.length == 0) {
    return help()
  }
  
  const command = unprocessed[0]
  switch (command) {
    case 'help':
      help()
      break;

    case 'list':
      await list(args)
      break;
    
    case 'get':
      await get(args)
      break;

    case 'create':
      await create(args)
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
