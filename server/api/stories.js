const router = require('express').Router()
const {Story, User} = require('../db/models')
const Sentencer = require('sentencer')
const unirest = require('unirest')
const nlp = require('compromise')
const randy = require('randy')
const htmlToRtf = require('html-to-rtf')
const fs = require('fs')
const path = require('path')
module.exports = router

const createDownloadFile = (story, user) => {
  // Creates rtf layout for file
  const html = `<div>
      <p style="font-size: 60px;" align="center"><i>${story.prompt}</i></p>
      <br/>
      <br/>
      <p align="center"><i>A story by ${user.username}</i></p>
      <br/>
      <br/>
      <p>${story.text}</p>
      </div>`
  // Saves file to public/download folder
  htmlToRtf.saveRtfInFile(
    path.join(
      __dirname,
      '..',
      '..',
      'public',
      'download',
      `${user.username.split(' ').join('_')}_${story.id}.rtf`
    ),
    htmlToRtf.convertHtmlToRtf(html)
  )
}

router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      // Get all of logged-in user's stories
      const userId = Number(req.user.dataValues.id)
      const stories = await Story.findAll({
        where: {
          userId
        }
      })
      res.json(stories)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/story/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      // Pulls story based on Id
      const storyId = Number(req.params.storyId)
      const story = await Story.findByPk(storyId)
      // Automatically generates rtf file to prepare for download
      createDownloadFile(story, req.user)
      res.json(story)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/def/:text', async (req, res, next) => {
  try {
    if (req.user) {
      // Get definition based off of text passed in
      const {text} = req.params
      // Call WordsAPI for definitions
      const def = await unirest
        .get(`https://wordsapiv1.p.rapidapi.com/words/${text}/definitions`)
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      res.json(def)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    if (req.user) {
      // Create a new story, with a prompt also generated
      const userId = Number(req.user.dataValues.id)
      // Calls WordsAPI for a verb to use
      let verb = await unirest
        .get(
          `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=verb&letterPattern=^[A-Za-z]*$`
        )
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      verb = verb.body.word
      //Even though verbPresentTense and verbFutureTense are currently never used, these variables exist should there be any new template sentences added in the future that could make use of them.
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
      // Calls WordsAPI for adverb to use
      let adverb = await unirest
        .get(
          `https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=adverb&letterPattern=^[A-Za-z]*$`
        )
        .header('X-RapidAPI-Host', 'wordsapiv1.p.rapidapi.com')
        .header('X-RapidAPI-Key', process.env.WORDS_API_KEY)
      adverb = adverb.body.word
      // Array of skeleton sentences to be used for final prompt. The '{{}}' fields are for Sentencer to fill in the appropriate form of word in these spots
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
      // Uses Randy to pull a random string from the above array, and then calls Sentencer to fill in random nouns and adjectives in the appropriate placecs
      const prompt = Sentencer.make(randy.choice(prompts))
      // Saves new story to backend
      const story = await Story.create({
        prompt,
        userId
      })
      // Creates rtf file
      createDownloadFile(story, req.user)
      res.status(201).json(story)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.put('/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user.dataValues.id
      const {text, length} = req.body
      const storyId = Number(req.params.storyId)
      // Updates both the text and length of the story in the database
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
      // Creates new rtf file with latest updates
      await createDownloadFile(story, req.user)
      res.status(201).json(story)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/suggestion', async (req, res, next) => {
  try {
    // Pulls the text from the text editor
    let {text} = await req.body
    // Removes p tags so that they are not included in final suggestion
    //should also include other tags like spaces to remove
    text = text.replace('<p>', '')
    text = text.replace('</p>', '')
    // Pulls all the nouns found in the text and saves them to an array
    const nouns = nlp(text)
      .nouns()
      .data()
      .map(nounObj => nounObj.main)
    // Separates common nouns by checking if a plural version exists
    const commonNounsIndex = nlp(text)
      .nouns()
      .hasPlural()
    // Creates two new arrays for common and proper nouns
    const commonNouns = nouns.filter((noun, i) => commonNounsIndex[i])
    const properNouns = nouns.filter((noun, i) => !commonNounsIndex[i])
    // Pulls all the verbs found in the text and saves them to an array
    const originalVerbs = nlp(text)
      .verbs()
    let verbs
    let tense
    if (originalVerbs && originalVerbs.length){
      verbs = originalVerbs.data().map(verbObj => verbObj.conjugations.Infinitive)
      tense = originalVerbs.conjugation()[0]
    }
    // Checks the tense in which the text has been written
    let suggestion
    // Array of potential starting points for the suggestion
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
    // Array of main clauses for suggestions, with the appropriate variables passed in. If it is unable to find any nouns pulled from Compromise, it will add new nouns from Sentencer.
    const suggestions = [
      `${
        properNouns.length ? randy.choice(properNouns) : 'the {{ noun }}'
      } proceeded to ${verbs && verbs.length ? randy.choice(verbs) : 'write'}.`,
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
    // Depending on the tense in which the original text was written, it will modify the suggestion tense to match if possible.
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
    } else {
      suggestion = nlp(
        Sentencer.make(
          `${randy.choice(sentenceStarts)}
          ${randy.choice(suggestions)}`
        )
      )
        .sentences()
        .toPresentTense()
        .out()
    }
    res.status(201).send(suggestion)
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
      // Calls function to generate rtf file
      createDownloadFile(story, user)
      res.sendStatus(202)
    } else {
      res.status(401).send('Sorry, only the user can access this.')
    }
  } catch (error) {
    next(error)
  }
})

router.delete('/rtf/:filename', async (req, res, next) => {
  try {
    // Deletes rtf file from public/download folder
    await fs.unlinkSync(
      path.join(
        __dirname,
        '..',
        '..',
        'public',
        'download',
        `${req.params.filename}.rtf`
      )
    )
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})
