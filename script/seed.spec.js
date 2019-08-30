'use strict'
/* global describe beforeEach it */

const seed = require('./seed')
const db = require('../server/db')

beforeEach(()=>db.sync({force: true}))

describe('seed script', () => {
  it('completes successfully', seed)
})
