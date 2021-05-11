const router = require('express').Router()
const {Story, User} = require('../db/models')
const fs = require('fs')
const path = require('path')

const {
  createDownloadFile,
  fetchDefinition,
  fetchRandomWord,
  getVerbTenses,
  getRandomPrompt,
  getSuggestion
} = require('./utils')

module.exports = router

router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      // Get all of logged-in user's stories
      const userId = Number(req.user.dataValues.id)
      const stories = await Story.findAll({
        where: {
          userId,
        },
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
      const def = await fetchDefinition(text)
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

      const verb = await fetchRandomWord('verb')

      const adverb = await fetchRandomWord('adverb')
      // Form prompt using verbs and adverb from above
      const prompt = getRandomPrompt({adverb, verb})

      const story = await Story.create({
        prompt,
        userId,
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
          length,
        },
        {
          where: {
            userId,
            id: storyId,
          },
          returning: true,
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
    // Removes HTML tags and trailing spaces from text
    const suggestion = getSuggestion(text)

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
