const router = require('express').Router()
const {Story} = require('../db/models')
module.exports = router

router.get('/:storyId', async (req, res, next) => {
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

router.get('/all/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = Number(req.params.userId)
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

router.post('/', async (req, res, next) => {
  try {
    if (req.user) {
      const {prompt} = req.body
      const story = await Story.create({
        prompt
      })
      res.json(story)
    } else {
      res.status(400).send('Sorry, only the user can access this.')
    }
  } catch (err) {
    next(err)
  }
})

router.put('/:storyId', async (req, res, next) => {
  try {
    if (req.user) {
      const userId = req.user.dataValues.id
      const {text} = req.body
      const story = await Story.update(
        {
          text
        },
        {
          where: {
            userId
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
