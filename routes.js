'use strict'

const Router = require('koa-router')

const { authenticateOrganizer } = require('./middleware/authentication')
const { handleErrors, handleNotFound } = require('./middleware/errors')
const responseErrors = require('./errors/response')

const router = new Router()
router.use(handleErrors)

const ROLES = [
  { id: 1, name: 'Kamarád' },
  { id: 2, name: 'Podvodník' },
  { id: 3, name: 'Opičák' },
  { id: 4, name: 'Sluníčkář' },
  { id: 5, name: 'Váhavec' },
  { id: 6, name: 'Gambler' },
  { id: 7, name: 'Mstitel' },
  { id: 8, name: 'Šachista' },
]


// Force redirect http requests to https
router.use((ctx, next) => {
  if (ctx.headers['x-forwarded-proto'] !== 'https') {
    throw new responseErrors.ForbiddenError('Https is required.')
  }
  return next()
})

// Game routes
// Get team state
router.get('/games/bgi63c/teams/1', (ctx, next) => {
  ctx.status = 200
  ctx.body = {
    id: 1,
    name: 'Berusky',
    number: 42,
    score: 4579.45,
    state: 'Podvodník (2)',
    possibleMoves: ROLES.filter(role => role.id !== 2)
  }
})
router.get('/games/bgi63c/teams/12345', (ctx, next) => {
  throw new responseErrors.NotFoundError('Team 12345 doesn\'t exist.')
})
router.get('/games/cfb4bc/teams/12345', (ctx, next) => {
  throw new responseErrors.NotFoundError('Unknown game instance cfb4bc.')
})

// Change game state
router.post('/games/bgi63c/teams/1/state', authenticateOrganizer, (ctx, next) => {
  const state = parseInt(ctx.request.body.state)
  if (ROLES.map(role => role.id).filter(id => id !== 2).includes(state)) {
    ctx.body = {
      id: 1,
      name: 'Berusky',
      number: 42,
      score: 4869.45,
      state: `${ROLES.filter(role => role.id == state).map(role => role.name).join('')} (${state})`,
      possibleMoves: ROLES.filter(role => role.id !== state)
    }
    return next()
  }
  if (state === 2) {
    throw new responseErrors.BadRequestError('You already have Podvodník selected.')
  }
  throw new responseErrors.BadRequestError('Unknown target state.')
})
router.post('/games/bgi63c/teams/12345/state', (ctx, next) => {
  throw new responseErrors.NotFoundError('Team 12345 doesn\'t exist.')
})
router.post('/games/cfb4bc/teams/12345/state', (ctx, next) => {
  throw new responseErrors.NotFoundError('Unknown game instance cfb4bc.')
})

// Revert game state change
router.delete('/games/bgi63c/teams/1/state', authenticateOrganizer, (ctx, next) => {
  ctx.body = {
    id: 1,
    name: 'Berusky',
    number: 42,
    score: 4349.45,
    state: 'Kamarád (1)',
    possibleMoves: ROLES.filter(role => role.id !== 1)
  }
  throw new responseErrors.BadRequestError('Unknown target state.')
})
router.delete('/games/bgi63c/teams/2/state', authenticateOrganizer, (ctx, next) => {
  throw new responseErrors.BadRequestError('No previous state.')
})
router.delete('/games/bgi63c/teams/12345/state', (ctx, next) => {
  throw new responseErrors.NotFoundError('Team 12345 doesn\'t exist.')
})
router.delete('/games/cfb4bc/teams/12345/state', (ctx, next) => {
  throw new responseErrors.NotFoundError('Unknown game instance cfb4bc.')
})


router.use(handleNotFound)

const routes = router.routes()

module.exports = routes
