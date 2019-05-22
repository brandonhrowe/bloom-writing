const router = require('express').Router()
const {Story, User} = require('../db/models')
const Sentencer = require('sentencer')
const unirest = require('unirest')
const nlp = require('compromise')
const randy = require('randy')
const htmlToRtf = require('html-to-rtf')
const fs = require('fs')
module.exports = router

const createDownloadFile = (story, user) => {
  const html = `<div>
      <p style="font-size: 60px;" align="center"><i>${story.prompt}</i></p>
      <br/>
      <br/>
      <p align="center"><i>A story by ${user.username}</i></p>
      <br/>
      <br/>
      <p>${story.text}</p>
      </div>`
  htmlToRtf.saveRtfInFile(
    `${__dirname}/../../public/download/${user.username.split(' ').join('_')}_${
      story.id
    }.rtf`,
    htmlToRtf.convertHtmlToRtf(html)
  )
}

router.get('/story/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      const storyId = Number(req.params.storyId)
      const story = await Story.findByPk(storyId)
      createDownloadFile(story, req.user)
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
        `Write a story about what it means to ${verb}, as told by {{ a_noun }}.`,
        `Write a story in the form of a stream-of-conscience, as experienced by {{ a_noun }}.`,
        `Write a story where, instead of speaking, the characters ${verb}.`,
        `Write a story consisting of only dialogue between {{ a_noun }} and {{ nouns }}.`,
        `Write a story about a city where {{ nouns }} ${verb} and the {{ nouns }} are {{ adjective }}.`,
        `Write a story that begins, "If on {{ a_noun }}'s night {{ a_noun }}..."`,
        `Write a story about {{ a_noun }} that lives in {{ a_noun }}.`
      ]
      const prompt = Sentencer.make(randy.choice(prompts))
      const story = await Story.create({
        prompt,
        userId
      })
      createDownloadFile(story, req.user)
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
      const [, [story]] = await Story.update(
        {
          text,
          length
        },
        {
          where: {
            userId,
            id: storyId
          },
          returning: true
        }
      )
      await createDownloadFile(story, req.user)
      res.json(story)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/suggestion', async (req, res, next) => {
  try {
    let {text} = await req.body
    text = text.replace('<p>', '')
    text = text.replace('</p>', '')
    //should also include other tags like spaces to remove
    const nouns = nlp(text)
      .nouns()
      .data()
      .map(nounObj => nounObj.main)
    const commonNounsIndex = nlp(text)
      .nouns()
      .hasPlural()
    const commonNouns = nouns.filter((noun, i) => commonNounsIndex[i])
    const properNouns = nouns.filter((noun, i) => !commonNounsIndex[i])
    const verbs = nlp(text)
      .verbs()
      .data()
      .map(verbObj => verbObj.conjugations.Infinitive)
    const tense = nlp(text)
      .verbs()
      .conjugation()[0]
    let suggestion
    const sentenceStarts = [
      'After that, ',
      'However, ',
      'And then, ',
      'Luckily, ',
      'Fortunately, ',
      'Unfortunately, ',
      'To the dismay of everyone, ',
      'But if one were to recall, '
    ]
    const suggestions = [
      `${
        properNouns.length ? randy.choice(properNouns) : 'the {{ noun }}'
      } proceeded to ${randy.choice(verbs)}.`,
      `the {{ noun }} was {{ adjective }}, waiting for ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      }.`,
      `there were even more ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      } on the way.`,
      `there was {{ an_adjective }} ${
        commonNouns.length ? randy.choice(commonNouns) : '{{ nouns }}'
      }`
    ]

    if (tense === 'Past') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toPastTense()
        .out()
    } else if (tense === 'Present') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toPresentTense()
        .out()
    } else if (tense === 'Future') {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toFutureTense()
        .out()
    }
    res.send(suggestion)
  } catch (error) {
    next(error)
  }
})

router.get('/rtf/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      const storyId = Number(req.params.storyId)
      const story = await Story.findByPk(storyId)
      const user = await User.findByPk(story.userId)
      const html = `<div>
      <p style="font-size: 60px;" align="center"><i>${story.prompt}</i></p>
      <br/>
      <br/>
      <p align="center"><i>A story by ${user.username}</i></p>
      <br/>
      <br/>
      <p>${story.text}</p>
      </div>`
      htmlToRtf.saveRtfInFile(
        `${__dirname}/../../public/download/${user.username
          .split(' ')
          .join('_')}_${story.id}.rtf`,
        htmlToRtf.convertHtmlToRtf(html)
      )
      res.sendStatus(202)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (error) {
    next(error)
  }
})

router.delete('/rtf/:filename', async (req, res, next) => {
  try {
    fs.unlinkSync(`${__dirname}/../../public/download/${req.params.filename}.rtf`)
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})
