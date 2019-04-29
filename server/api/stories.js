const router = require('express').Router()
const {Story} = require('../db/models')
const Sentencer = require('sentencer')
const unirest = require('unirest')
const nlp = require('compromise')
const randy = require('randy')
module.exports = router

router.get('/story/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      const storyId = Number(req.params.storyId)
      const story = await Story.findByPk(storyId)
      res.json(story)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/all', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = Number(req.user.dataValues.id)
      const stories = await Story.findAll({
        where: {
          userId
        }
      })
      res.json(stories)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/def/:text', async (req, res, next) => {
  try {
    if (req.user) {
      const {text} = req.params
      const def = await unirest
        .get(`https://wordsapiv1.p.rapidapi.com/words/${text}/definitions`)
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      res.json(def)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/create', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = Number(req.user.dataValues.id)
      let verb = await unirest
        .get(
          `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=verb&letterPattern=^[A-Za-z]*$`
        )
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      verb = verb.body.word
      let verbPresentTense
      let verbPastTense
      let verbFutureTense
      if (
        nlp(verb)
          .verbs()
          .data().length
      ) {
        verbPresentTense = nlp(verb)
          .verbs()
          .toPresentTense()
          .out()
        verbPastTense = nlp(verb)
          .verbs()
          .toPastTense()
          .out()
        verbFutureTense = nlp(verb)
          .verbs()
          .toFutureTense()
          .out()
      }

      let adverb = await unirest
        .get(
          `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=adverb&letterPattern=^[A-Za-z]*$`
        )
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      adverb = adverb.body.word
      const prompts = [
        `Write a story about {{ adjective }} {{ nouns }} that ${adverb} ${
          verbPastTense ? verbPastTense : verb
        } {{ nouns }}.`,
        `Write a story about {{ an_adjective }} {{ noun }} and a group of {{ nouns }}.`,
        `Write a story where the protagonist is {{ an_adjective }} {{ noun }} that wants to ${verb}.`,
        `Write a story where the first line is, "It was {{ an_adjective }}, {{ adjective }} night when the {{ nouns }} came..."`,
        `Write a story about the what it means to ${verb}, as told by {{ a_noun }}.`,
        `Write a story in the form of a stream-of-conscience, as experienced by {{ a_noun }}.`,
        `Write a story where, instead of speaking, the characters ${verb}.`,
        `Write a story consisting of only dialogue between {{ a_noun }} and {{ nouns }}.`,
        `Write a story about a city where {{ nouns }} ${verb} and the {{ nouns }} are {{ adjective }}`,
        `Write a story that begins, "If on {{ a_noun }}'s night {{ a_noun }}..."`,
        `Write a story about {{ a_noun }} that lives in {{ a_noun }}`
      ]
      const prompt = Sentencer.make(randy.choice(prompts))
      const story = await Story.create({
        prompt,
        userId
      })
      res.json(story)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.put('/story', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user.dataValues.id
      const {storyId, text, length} = req.body
      const story = await Story.update(
        {
          text,
          length
        },
        {
          where: {
            userId,
            id: storyId
          }
        }
      )
      res.json(story)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})
