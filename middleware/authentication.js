'use strict'

const responseErrors = require('../errors/response')

async function authenticateOrganizer(ctx, next) {
  const data = await authenticateTokenJWT(ctx)
  if (!data || !data.id || data.disabled) {
    throw new responseErrors.UnauthorizedError()
  }
  console.log(`Organizer id: ${data.id}`)
  console.log(`Organizer email: ${data.email}`)
  ctx.state.organizer = data
  return next()
}

function authenticateTokenJWT(ctx) {
  if (!ctx) {
    throw new Error('Context is missing in authenticateToken function!')
  }
  console.log(ctx.header)
  const parsedAuthHeader = parseAuthHeader(ctx.header.authorization)
  if (!parsedAuthHeader || !parsedAuthHeader.value
    || !parsedAuthHeader.scheme || parsedAuthHeader.scheme.toLowerCase() !== 'jwt') {
    return null
  }
  return parsedAuthHeader.value === 'bti34tbri8t34rtdbiq34tvdri6qb3t4vrdtiu4qv' && {
    id: 1,
    name: 'Franta',
  }
}

function parseAuthHeader(hdrValue) {
  const re = /(\S+)\s+(\S+)/u
  if (!hdrValue || typeof hdrValue !== 'string') {
    return null
  }
  const matches = hdrValue.match(re)
  return matches && { scheme: matches[1], value: matches[2] }
}

module.exports = {
  authenticateOrganizer,
}
