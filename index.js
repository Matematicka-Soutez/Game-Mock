'use strict'

const cluster = require('cluster')
const path = require('path')
const http = require('http')
const Koa = require('koa')
const koaBody = require('koa-body')
const koaCompress = require('koa-compress')
const koaCors = require('@koa/cors')
const routes = require('./routes')

const app = new Koa()
app.server = http.createServer(app.callback())

// Setup middleware
app.use(koaCors())
app.use(koaCompress())
app.use(koaBody({
  patchKoa: true,
  urlencoded: true,
  text: false,
  json: true,
  multipart: false,
  strict: false,
}))

// Setup routes
app.use(routes)

// Start method
app.start = async () => {
  console.log('Starting server ...')
  await new Promise((resolve, reject) => {
    const listen = app.server.listen(process.env.PORT || 3000, err => err ? reject(err) : resolve(listen))
  })
  console.log(`==> 🌎  Server listening on port ${process.env.PORT || 3000}.`)
}

// Stop method
app.stop = async () => {
  if (!app.server) {
    console.log('Server not initialized yet.')
    return
  }

  console.log('Stopping server ...')
  await app.server.close()
  console.log('Server stopped.')

  process.exit(0) // eslint-disable-line no-process-exit
}

// Something can happen outside the error handling middleware, keep track of that
app.on('error', err => log.error(err, 'Unhandled application error.'))

// Something can go terribly wrong, keep track of that
process.once('uncaughtException', fatal)
process.once('unhandledRejection', fatal)

function fatal(err) {
  console.log(err, 'Fatal error occurred. Exiting the app.')

  // If the server does not terminate itself in a specific time, just kill it
  setTimeout(() => {
    throw err
  }, 5000).unref()
}

// If app was executed directly through node command or in a worker process
if (require.main === module || cluster.isWorker) {
  app.start()

  process.once('SIGINT', () => app.stop())
  process.once('SIGTERM', () => app.stop())
}

module.exports = app
