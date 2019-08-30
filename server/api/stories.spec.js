const request = require('supertest-session')
const {expect} = require('chai')

const db = require('../db')
const app = require('../')

before(() => db.sync({force: true}))

describe('Stories routes', () => {
  let authenticatedSession = null

  before('Creates user and signs in', done => {
    let session = request(app)
    session
      .post('/auth/signup')
      .send({
        username: 'Calvino',
        email: 'icalvino@gmail.com',
        password: '12345'
      })
      .expect(200)
      .then(res => {
        const resJSON = JSON.parse(res.text)
        expect(resJSON.username).to.equal('Calvino')
        expect(resJSON.email).to.equal('icalvino@gmail.com')
        authenticatedSession = session
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Creates a story for the user', done => {
    authenticatedSession
      .post('/api/stories')
      .expect(201)
      .then(res => {
        const resJSON = JSON.parse(res.text)
        expect(resJSON.prompt).to.include('Write a story')
        expect(resJSON.prompt.length).to.be.greaterThan(13)
        expect(resJSON.text).to.equal('Start your story here!')
        expect(resJSON.userId).to.equal(1)
        expect(resJSON.id).to.equal(1)
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Gets all stories', done => {
    authenticatedSession
      .get('/api/stories')
      .expect(200)
      .then(res => {
        const resArr = JSON.parse(res.text)
        expect(Array.isArray(resArr)).to.equal(true)
        expect(resArr.length).to.equal(1)
        expect(resArr[0].prompt).to.include('Write a story')
        expect(resArr[0].prompt.length).to.be.greaterThan(13)
        expect(resArr[0].text).to.equal('Start your story here!')
        expect(resArr[0].length).to.equal(4)
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Can get a preexisting story', done => {
    authenticatedSession
      .get('/api/stories/story/1')
      .expect(200)
      .then(res => {
        const resJSON = JSON.parse(res.text)
        expect(resJSON.prompt).to.include('Write a story')
        expect(resJSON.prompt.length).to.be.greaterThan(13)
        expect(resJSON.text).to.equal('Start your story here!')
        expect(resJSON.userId).to.equal(1)
        expect(resJSON.id).to.equal(1)
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Can update a preexisting story', done => {
    authenticatedSession
      .put('/api/stories/1')
      .send({
        text:
          'Happy families are all alike; every unhappy family is unhappy in its own way.',
        length: 77
      })
      .expect(201)
      .then(res => {
        const resJSON = JSON.parse(res.text)
        expect(resJSON.prompt).to.include('Write a story')
        expect(resJSON.text).to.equal(
          'Happy families are all alike; every unhappy family is unhappy in its own way.'
        )
        expect(resJSON.length).to.equal(77)
        expect(resJSON.userId).to.equal(1)
        expect(resJSON.id).to.equal(1)
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Can give a suggested next sentence', done => {
    authenticatedSession
      .post('/api/stories/suggestion')
      .send({
        text: '<p> John, the cat in the hat </p>'
      })
      .expect(201)
      .then(res => {
        const resArr = res.text.split(' ')
        expect(
          resArr.findIndex(word =>
            ['cat', 'hat', 'cats', 'hats', 'john'].includes(word)
          )
        ).to.be.greaterThan(-1)
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })

  it('Can give a definition for a word', done => {
    authenticatedSession
      .get('/api/stories/def/odyssey')
      .expect(200)
      .then(res => {
        const resJSON = JSON.parse(res.text).body
        expect(resJSON.word).to.equal('odyssey')
        expect(resJSON.definitions[0].definition).to.equal(
          'a Greek epic poem (attributed to Homer) describing the journey of Odysseus after the fall of Troy'
        )
        expect(resJSON.definitions[0].partOfSpeech).to.equal('noun')
        return done()
      })
      .catch(err => {
        return done(err)
      })
  })
})
