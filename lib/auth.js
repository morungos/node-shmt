
require('node-fetch')

const express = require('express')
const open = require('open')
const bodyParser = require('body-parser')
const base64url = require('base64-url')
const { v4: uuidv4 } = require('uuid')
const crypto = require('crypto')

async function authorize() {

  const randomSecret = () => base64url.encode(uuidv4({}, []))

  const state = randomSecret()
  const verifier = `${randomSecret()}${randomSecret()}${randomSecret()}`
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64')

  const startURL =
    'https://app.hubspot.com/oauth/authorize?' +
    [
      ['response_type', 'code'],
      ['client_id', process.env.HUBSPOT_CLIENT_ID],
      ['redirect_uri', process.env.HUBSPOT_REDIRECT_URL],
      ['state', state],
      ['code_challenge', verifier],
    ]
        .map((v) => v.join('='))
        .join('&')

  const app = express()

  await open(startURL, { newInstance: true })
}

module.exports = authorize



// const app = express()

// open(startURL, { app: { name: open.apps.chrome } })
//   .then(() => null)
//   .catch(() => null)

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

// app.get('/', (req, res, next) => {
//   res.setHeader('Content-Type', 'text/html')
//   res.send(`
// <html>
//   <head><title>Request a Token</title></head>
//   <body>
//     <form method="POST" action="/token">
//       <input type="hidden" name="code" value="${decodeURI(req.query.code)}" />
//       <input type="submit" value="Get Token" />
//     </form>
//   </body>
// </html>`)
// })

// app.post('/token', async (req, res, next) => {
//   try {
//     const tokenRequest = {
//       method: 'post',
//       headers: { 'Content-Type': 'application/token' },
//       body: JSON.stringify({
//         grant_type: 'authorization_code',
//         code: req.body.code,
//         client_id: process.env.LIVECHAT_AGENT_CLIENT_ID,
//         client_secret: process.env.LIVECHAT_AGENT_CLIENT_SECRET,
//         redirect_uri: 'http://localhost:3000',
//         code_verifier: verifier,
//       }),
//     }

//     const result = await fetch('https://accounts.livechat.com/v2/token', tokenRequest)

//     const details = await result.json()
//     const body = [
//       '<html>',
//       '<head><title>Token Response</title></head>',
//       '<body>',
//       result.ok ? '<h1>Success</h1>' : '<h1>Error</h1>',
//       '<dl>',
//     ]

//     for (const key in details) {
//       body.push(`<dt>${key}</dt>`, `<dd>${details[key]}</dd>`)
//     }

//     body.push('</dl>', '</body>', '</html>')

//     if (result.ok) {
//       console.log(details)
//     } else {
//       console.error(details)
//     }

//     res.setHeader('Content-Type', 'text/html')
//     res.send(body.join(''))
//   } catch (error) {
//     console.error(error)
//   }
// })

// app.listen(3000)
